"use strict";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const now = new Date();

AWS.config.update({ region: process.env.AWS_REGION });

module.exports.saveItem = (TABLE_NAME, item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  return dynamo
    .put(params)
    .promise()
    .then(() => {
      return item.itemId;
    });
};

module.exports.getItem = (TABLE_NAME, id, sortKey) => {
  const params = {
    Key: {
      id: id,
      sortKey: sortKey,
    },
    TableName: TABLE_NAME,
  };

  return dynamo
    .get(params)
    .promise()
    .then((result) => {
      return result.Item;
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

module.exports.scanQueueTable = async (TABLE_NAME, userId) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};


module.exports.queryTableByEmail = async (TABLE_NAME, email) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};


module.exports.queryTableByCompanyId = async (TABLE_NAME, companyId) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "companyId = :companyId",
    ExpressionAttributeValues: {
      ":companyId": companyId,
    },
  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};

module.exports.siretChecker = async (TABLE_NAME, siret) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "siretNumber = :siret",
    ExpressionAttributeValues: {
      ":siret": siret,
    },
  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};


module.exports.clientIdGetter = async (TABLE_NAME, clientId) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "clientId = :clientId",
    ExpressionAttributeValues: {
      ":clientId": clientId,
    },
  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};
module.exports.adminGetter = async (TABLE_NAME) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "#group = :group",
    ExpressionAttributeValues: {
      ":group": "admin",
    },
    ExpressionAttributeNames: {
      "#group": "group",
    },

  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};
module.exports.commercialGetter = async (TABLE_NAME) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "#group = :group",
    ExpressionAttributeValues: {
      ":group": "commercial",
    },
    ExpressionAttributeNames: {
      "#group": "group",
    },

  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};


module.exports.packNameGetter = async (TABLE_NAME, product_id) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: "product_id = :product_id",
    ExpressionAttributeValues: {
      ":product_id": product_id,
    },
  };
  return dynamo
    .scan(params)
    .promise()
    .then((result) => {
      return result.Items;
    });
};


module.exports.deleteItem = (TABLE_NAME, id, sortkey) => {
  const params = {
    Key: {
      id: id,
      created_date: sortkey,
    },
    TableName: TABLE_NAME,
  };

  return dynamo.delete(params).promise();
};

module.exports.updateItem = (
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
module.exports.updateItemPack = (
  TABLE_NAME,
  id,
  paramName,
  paramValue
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
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

module.exports.updateList = (
  TABLE_NAME,
  id,
  sortkey,
  paramValue,
  index
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: "SET queueImg[" + index + "] = :paramValue",

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

/**************************update element in list */

module.exports.updateElementList = (
  TABLE_NAME,
  id,
  sortkey,
  paramValue,
  index
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: "SET queues[" + index + "].subQueues = :paramValue",

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


module.exports.updateItemList= (
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
    UpdateExpression: `SET #paramName = list_append(#paramName, :paramValue)`,
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


module.exports.updateItemListQueue= (
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
      userId: sortkey,

    },
    UpdateExpression: `SET #paramName = list_append(#paramName, :paramValue)`,
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


module.exports.updateItemWithoutSort = (
  TABLE_NAME,
  id,
  paramName,
  paramValue
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,

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



module.exports.updateconfirm = (TABLE_NAME, id, sortkey) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #updatedAt = :updatedAt, #isVerified = :isVerified`,
    ExpressionAttributeNames: {
      "#updatedAt": "updated_date",
      "#isVerified": "isVerified",
    },

    ExpressionAttributeValues: {
      ":isVerified": true,
      ":updatedAt": now.toISOString(),
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





module.exports.upVoteBonus = (TABLE_NAME, id,sortkey,bonusVal) => { 
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: 'SET #bonus = #bonus + :inc',  


    ExpressionAttributeNames : {
      '#bonus' : 'bonus'
  },


    ExpressionAttributeValues: {
      ':inc' :  bonusVal
    },
    ReturnValues: 'UPDATED_NEW', 
  };

  return dynamo
    .update(params)
    .promise()
    .then((response) => {
      return response.Attributes;
    });
};

module.exports.upVoteUid = () => { 
  const params = {
    TableName: "config",
    Key: {
      id: "IdCounter",
    },
    UpdateExpression: 'ADD #a :x',
    ExpressionAttributeNames: {'#a' : "uid"},
    ExpressionAttributeValues: {':x' : 1},
    ReturnValues: 'UPDATED_NEW', 
  };

  return dynamo
    .update(params)
    .promise()
    .then((response) => {
      return response.Attributes;
    });
};




module.exports.resetBeep = (TABLE_NAME, id, sortkey) => { 
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #isVerified = :isVerified`,
    ExpressionAttributeNames: {
      "#isVerified": "isVerified",
    },

    ExpressionAttributeValues: {
      ":isVerified": { "N" : 1 },
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



module.exports.updateCredential = (
  TABLE_NAME,
  id,
  sortkey,
  responsableFullName,
  companyName,
  phone,

) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #responsableFullName = :responsableFullName, #companyName = :companyName, #phone = :phone`,
    ExpressionAttributeNames: {
      "#responsableFullName": "responsableFullName",
      "#companyName": "companyName",
      "#phone": "phone",

    },

    ExpressionAttributeValues: {
      ":responsableFullName": responsableFullName,
      ":companyName": companyName,
      ":phone": phone,
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

module.exports.updateSubUserCredential = (
  TABLE_NAME,
  id,
  sortkey,
  queue,
  subQueue,
  fullName,
  phone
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #queue = :queue, #subQueue = :subQueue, #fullName = :fullName ,#phone = :phone`,
    ExpressionAttributeNames: {
      "#queue": "queue",
      "#subQueue": "subQueue",
      "#fullName": "fullName",
      "#phone": "phone",

    },

    ExpressionAttributeValues: {
      ":queue": queue,
      ":subQueue": subQueue,
      ":fullName": fullName,
      ":phone": phone,
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

/**************************update credential pack */
module.exports.updatePackCredential = (
  TABLE_NAME,
  id,
  sortkey,
  name,
  desc,
  prix,
  active
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #name = :name, #desc = :desc, #prix = :prix, #active = :active`,
    ExpressionAttributeNames: {
      "#name": "name",
      "#desc": "desc",
      "#prix": "prix",
      "#active": "active",

    },

    ExpressionAttributeValues: {
      ":name": name,
      ":desc": desc,
      ":prix": prix,
      ":active": active,
 
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


/*************************set pack cread from stripe*/
module.exports.setPackCredential = (
  TABLE_NAME,
  id,
  sortkey,
  price_id,
  product_id,
) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: id,
      created_date: sortkey,
    },
    UpdateExpression: `SET #price_id = :price_id, #product_id = :product_id`,
    ExpressionAttributeNames: {
      "#price_id": "price_id",
      "#product_id": "product_id",
    },

    ExpressionAttributeValues: {
      ":price_id": price_id,
      ":product_id": product_id,
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
