# NoteMatcher

This is a React/Redux program. It allows you to sing into your microphone and
have the frequency of your voice visualized in realtime. As well as provides
a barebones midi player so you can sing along and try to `note match`.


### Note: This is smaller frontend only version of the application copied from a private repo.

## Running the app

After git cloning it down to run it in production:
```

# make sure you have the npm module serve installed
# skip this step if you already do
yarn global add serve

serve -s build
```

To run this in development mode
with all of create-react-app's glory.
```
yarn install
yarn start

# In another terminal you need
# to watch the scss to compile it.
# This is not included in the webpack
# config. That is something I will 
# add one day.
yarn run watch-css
```

To run prettier just do:
```
yarn run prettier
```

## Project Structure
TODO: write about the structure
