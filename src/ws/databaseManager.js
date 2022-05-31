"use strict";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const now = new Date();

AWS.config.update({ region: process.env.AWS_REGION });




module.exports.updateConn = (
  TABLE_NAME,
  id,
  paramName,
  paramValue
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      connId : id,
    },
    UpdateExpression: `SET #paramName = :paramValue`,
    ExpressionAttributeNames: {
      "#paramName": paramName,
    },

    ExpressionAttributeValues: {
      ":paramValue": paramValue,
    },

    ReturnValues: "ALL_NEW",
  };

  return dynamo
    .update(params)
    .promise()
    .then((response) => {
      return response.Attributes;
    });
};



module.exports.updateItemUser = (
  TABLE_NAME,
  id,
  sortkey,
  paramName,
  paramValue
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #paramName = :paramValue`,
    ExpressionAttributeNames: {
      "#paramName": paramName,
    },

    ExpressionAttributeValues: {
      ":paramValue": paramValue,
    },

    ReturnValues: "ALL_NEW",
  };

  return dynamo
    .update(params)
    .promise()
    .then((response) => {
      return response.Attributes;
    });
};

module.exports.updateItemConn = (
  TABLE_NAME,
  connId,
  paramName,
  paramValue
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      connId: connId,
    },
    UpdateExpression: `SET #paramName = :paramValue`,
    ExpressionAttributeNames: {
      "#paramName": paramName,
    },

    ExpressionAttributeValues: {
      ":paramValue": paramValue,
    },

    ReturnValues: "ALL_NEW",
  };

  return dynamo
    .update(params)
    .promise()
    .then((response) => {
      return response.Attributes;
    });
};



module.exports.queryConnTable = async (TABLE_NAME, connId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "connId = :connId",
    ExpressionAttributeValues: {
      ":connId": connId,
    },
  };

  return dynamo
    .query(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};
module.exports.queryTable = async (TABLE_NAME, id) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  };

  return dynamo
    .query(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};