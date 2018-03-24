import * as React from 'react';
import { scaleLinear } from 'd3-scale';

interface Props {
  height: number;
  width: number;
  data: FreqDataPoint[];
  note: Note;

  currentTime: Date;

  getXPosition: (canvasWidth: number) => (date: Date) => number;

  children?: React.ReactNode;
}

const CENTS_OFF_ERROR_THRESHOLD = 40;
const CENTS_OFF_WARNING_THRESHOLD = 15;
const CENTS_IN_A_SEMITONE = 100;
const DEFAULT_CANVAS_HEIGHT = 100;

const RED = '#EE6A61';
const YELLOW = '#FEC625';
const GREEN = '#23d160';
const DARK = '#363636';

export default class NoteCanvas extends React.Component<Props, {}> {
  private canvas: HTMLCanvasElement | null = null;

  private colorScale: (num: number) => string = scaleLinear()
    .domain([
      -(CENTS_IN_A_SEMITONE / 2),
      -CENTS_OFF_WARNING_THRESHOLD,
      0,
      CENTS_OFF_WARNING_THRESHOLD,
      CENTS_IN_A_SEMITONE / 2
    ])
    .range([RED, YELLOW, GREEN, YELLOW, RED] as any) as any;

  private yScale: (y: number) => number = () => 0;

  private refreshYScale = () => {
    let canvasHeight: number = DEFAULT_CANVAS_HEIGHT;
    if (this.canvas) {
      canvasHeight = this.canvas.height;
    }

    this.yScale = scaleLinear()
      .domain([-(CENTS_IN_A_SEMITONE / 2), CENTS_IN_A_SEMITONE / 2])
      .range([canvasHeight, 0]);
  };

  /**
   * Drawing
   */

  private reset = () => {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCenterLine();
  };

  private drawData = (nextProps?: Props) => {
    (nextProps || this.props).data.forEach(datum => {
      this.drawPoint(datum);
    });
  };

  private drawPoint = (datum: FreqDataPoint) => {
    const { centsOffExpected, time } = datum;

    if (
      centsOffExpected < -(CENTS_IN_A_SEMITONE / 2) ||
      centsOffExpected > CENTS_IN_A_SEMITONE / 2
    )
      return;

    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();

    ctx.arc(
      this.props.getXPosition(this.canvas.width)(time),
      this.yScale(centsOffExpected),
      1,
      0,
      Math.PI * 2,
      false
    );
    ctx.globalAlpha = 1;
    ctx.fillStyle = DARK;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.props.getXPosition(this.canvas.width)(time),
      this.yScale(centsOffExpected),
      1.5,
      0,
      Math.PI * 2,
      false
    );
    ctx.fillStyle = this.colorScale(centsOffExpected);
    ctx.globalAlpha = 1;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.props.getXPosition(this.canvas.width)(time),
      this.yScale(centsOffExpected),
      4,
      0,
      Math.PI * 2,
      false
    );
    ctx.fillStyle = this.colorScale(centsOffExpected);
    ctx.globalAlpha = 0.5;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      this.props.getXPosition(this.canvas.width)(time),
      this.yScale(centsOffExpected),
      8,
      0,
      Math.PI * 2,
      false
    );
    ctx.fillStyle = this.colorScale(centsOffExpected);
    ctx.globalAlpha = 0.25;
    ctx.fill();
  };

  private drawCenterLine = () => {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // const bottom = this.yScale(-CENTS_OFF_WARNING_THRESHOLD);
    // const top = this.yScale(CENTS_OFF_WARNING_THRESHOLD);
    //const height = top - bottom;

    const goodThresholdTop = this.yScale(CENTS_OFF_WARNING_THRESHOLD);
    const goodThresholdBottom = this.yScale(-CENTS_OFF_WARNING_THRESHOLD);

    const okayThresholdTop = this.yScale(CENTS_OFF_ERROR_THRESHOLD);
    const okayThresholdTopBottom = goodThresholdTop;

    const errorTresholdTop = 0;
    const errorThresholdTopBottom = okayThresholdTop;

    const okayTresholdBottom = goodThresholdBottom;
    const okayTresholdBottomBottom = this.yScale(-CENTS_OFF_ERROR_THRESHOLD);

    const errorThresholdBottom = okayTresholdBottomBottom;
    const errorThresholdBottomBottom = this.yScale(-CENTS_IN_A_SEMITONE);

    if (this.props.note.includes('#')) {
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = DARK;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = GREEN;
    ctx.fillRect(
      0,
      goodThresholdTop,
      this.canvas.width,
      goodThresholdBottom - goodThresholdTop
    );

    ctx.globalAlpha = 0.1;
    ctx.fillStyle = YELLOW;
    // yellow top
    ctx.fillRect(
      0,
      okayThresholdTop,
      this.canvas.width,
      okayThresholdTopBottom - okayThresholdTop
    );
    ctx.fillRect(
      0,
      okayTresholdBottom,
      this.canvas.width,
      okayTresholdBottomBottom - okayTresholdBottom
    );

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = RED;
    // top red
    ctx.fillRect(
      0,
      errorTresholdTop,
      this.canvas.width,
      errorThresholdTopBottom - errorTresholdTop
    );
    ctx.fillRect(
      0,
      errorThresholdBottom,
      this.canvas.width,
      errorThresholdBottomBottom - errorThresholdBottom
    );

    // TOP LINE
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = DARK;
    ctx.fillRect(0, 0, this.canvas.width, 1);
  };

  /**
   * React Methods
   */

  componentDidMount() {
    this.refreshYScale();
    this.reset();
    this.drawData(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    const heightDiff = nextProps.height !== this.props.height;
    if (heightDiff) {
      this.refreshYScale();
    }

    if (
      nextProps.data !== this.props.data ||
      nextProps.width !== this.props.width ||
      heightDiff
    ) {
      window.requestAnimationFrame(() => {
        this.reset();
        this.drawData(nextProps);
      });
    }
  }

  render() {
    const { height, width } = this.props;

    return (
      <canvas ref={ref => (this.canvas = ref)} height={height} width={width} />
    );
  }
}
