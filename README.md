bay-area-transit
================

A realtime transit site - using Node, Handlebars and Bootstrap.

Steps to run:

1. Clone the repository

2. Go to root folder

3. Download and install node.js (if you don't already have it).

4. Install node dependencies

    npm install

5. Register for a 511.org API key from here (it is free, and takes only 5 minutes): 

    http://511.org/developer-resources_transit-api.asp

6. Set the "token" variable to this value in /Scripts/transit/transitService.js

    e.g. var token = "123-456-678-2343";

5. Run the node.js web server    

    node ./scripts/web-server.js
    
6. Open browser and navigate to main page

    http://localhost:8000/index.html
