"use strict";

const databaseManager = require(`./databaseManager`);
const TABLE_NAME = process.env.USERS_TABLE;



/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

// get rest by id ticket beep genertae 
exports.lambdaHandler = async (event, context) => {

  return resetBeep();

};



/**************************************** reset beeps function ****************************************************/

const resetBeep = async () => {

 let items = await databaseManager.adminGetter(TABLE_NAME);

 for(var i = 0; i < items.length; i++) {


    console.log(items[i])

      let paramName = "beepscount";
      let newVal = 0 ;

    try{
    await databaseManager.updateItem(TABLE_NAME, items[i].id ,items[i].created_date, paramName, newVal)

    } catch (err) {
    console.log(err)
    }


 }


  return sendResponse(
    200,
    JSON.stringify({
      message: `Successfully updated counter`,
    })
  );

};



function sendResponse(statusCode, message) {
  const response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
    },
    body: message,
  };
  return response;
}



