"use strict";

const databaseManager = require(`./databaseManager`);

const IBAN = require('iban');

const { Parser } = require('json2csv')

const AWS = require("aws-sdk");
const { nanoid } = require("nanoid/async");

const s3 = new AWS.S3();
const now = new Date();


const TABLE_NAME = process.env.USERS_TABLE;
const TABLE_PACKS = process.env.PACKS_TABLE;
const PAIEMENTS_TABLE = process.env.PAIEMENTS_TABLE;
const PROCESSUS_TABLE = process.env.PROCESSUS_TABLE;
const CONFIG_TABLE = process.env.CONFIG_TABLE;



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
  switch (event.httpMethod) {

    case "GET":

       if (event.resource == "/users/checkiban/{id}") {
        return checkIban(event);   
      }
      else if (event.resource == "/beep/reset/{id}") {
        return resetBeep(event);
      }
      else if (event.resource == "/commercial") {

        return commercialGett();
      }
      else if (event.resource == "/users/pay/data/{id}") {

        return onepaydata(event);
      }
      else if (event.resource == "/users/openpay") {

        return getOpenPay(event);
      }
      else if (event.resource == "/admin/closepay/{id}") {

        return closeFilPay(event);
      }


      else if (event.resource == "/admin/setmainpay/{id}") {

        return minCashBackSetter(event);
      }
      else if (event.resource == "/admin/getminpay") {

        return minCashBackgetter(event);
      }
      else if (event.resource == "/users/iban/{id}") {

        return getcleanRibList(event);
      }
      else if (event.resource == "/users/bilingInfo/{id}") {

        return getListBilingInfo(event);
      }
      else if (event.resource == "/admin/closedpay") {

        return getClosePay(event);
      }
      case "PUT":

       if (event.resource == "/packs/update/array/{id}") {
        return updatePackArray(event);
      } 
      else if (event.resource == "/user/demandepay/{id}") {
        return demandePay(event);
      }
      else if (event.resource == "/admin/updatepay/{id}") {
        return updateDemandePay(event);
      } 
      else if (event.queryStringParameters) {
        return payPresignedUrl(event);
      }
      else if (event.resource == "/admin/updatebiling/{id}") {
        return addBilingInfo(event);
      } 
      else if (event.resource == "/admin/deletebiling/{id}") {
        return deleteBiling(event);
      } 
      else if (event.resource == "/admin/idupdatebiling/{id}") {
        return updateIBilingInfo(event);
      } 


      case "POST":

        if (event.resource == "/admin/createpay") {
         return createPay(event);
       } 
 
    default:
      return sendResponse(
        404,
        JSON.stringify(`Unsupported method  ${event.httpMethod} `)
      );
  }
};


/****************************************boolean function return is user is commercial by email****************************************************/

const commercialGett = async () => {
  // const itemId = event.pathParameters.id;
  let items;

  try {
    items = await databaseManager.commercialGetter(TABLE_NAME);

    if (items.length === 0) {
      return sendResponse(
        200,
        JSON.stringify([])
      );
    }


  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }


  return sendResponse(
    200,
    JSON.stringify(items)
  );
};


/****************************************ajouter packfunction****************************************************/

const updatePackArray = async (event) => {
  const id = event.pathParameters.id;

  let {array} = JSON.parse(event.body);

  let items;

  try{
    items = await databaseManager.queryTable(TABLE_PACKS, id);
    if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}

  let paramName ="array";
  let paramValue = array;

  return databaseManager
  .updateItemPack(TABLE_PACKS, items[0].id, paramName, paramValue)
  .then((response) => {
    return sendResponse(
      200,
      JSON.stringify(response)
    );
  })


};


/****************************************ajouter packfunction****************************************************/

const getOpenPay = async () => {
  // let id = event.pathParameters.id;


  let items;

  try{
    items = await databaseManager.queryTableOpenPay(PAIEMENTS_TABLE);
    if (items.length === 0) {
    return sendResponse(
      200,
      JSON.stringify([])
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}
let cleanData;
 cleanData = items.map(function (obj) {
  return obj.doc_creating_date;
});

return sendResponse(
    200,
    JSON.stringify(cleanData)
);


};

/****************************************ajouter packfunction****************************************************/

const getClosePay = async () => {
  // let id = event.pathParameters.id;


  let items;

  try{
    items = await databaseManager.queryTableClosePay(PAIEMENTS_TABLE);
    if (items.length === 0) {
    return sendResponse(
      200,
      JSON.stringify([])
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}
let cleanData;
 cleanData = items.map(function (obj) {
  return { updated_date: obj.updated_date , filename: obj.path_doc.filename }; // obj.updated_date ,  obj.path_doc.filename
});

return sendResponse(
    200,
    JSON.stringify(cleanData)
);


};
/****************************************ajouter packfunction****************************************************/

const getcleanRibList = async (event) => {

  const userId = event.pathParameters.id;




let userData = await databaseManager.queryTable(TABLE_NAME, userId);

if (userData.length === 0) {
  return sendResponse(
    404,
    JSON.stringify({
      message: `item with this id : ${userId} not found`,
    })
  );
}

let biling = userData[0].bilingInfo;

if (biling.length!= 0){

    let cleanData;

  cleanData = biling.map(function (obj) {
    return obj.IBAN;
  });

  return sendResponse(
      200,
      JSON.stringify(cleanData)
  );




}
  return sendResponse(
    200,
    JSON.stringify([])
  );


};

/****************************************ajouter packfunction****************************************************/

const getListBilingInfo  = async (event) => {

  const userId = event.pathParameters.id;
let userData = await databaseManager.queryTable(TABLE_NAME, userId);

if (userData.length === 0) {
  return sendResponse(
    404,
    JSON.stringify({
      message: `item with this id : ${userId} not found`,
    })
  );
}

let biling = userData[0].bilingInfo;

  return sendResponse(
      200,
      JSON.stringify(biling)
  );


};

/****************************************ajouter packfunction****************************************************/

const onepaydata = async (event) => {
  let id = event.pathParameters.id;


  let items;

  try{
    items = await databaseManager.queryTableByDate(PAIEMENTS_TABLE,id);
    if (items.length === 0) {
    return sendResponse(
      200,
      JSON.stringify({})
    );
  }

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}

return sendResponse(
    200,
    JSON.stringify(items[0])
);


};
/****************************************ajouter packfunction****************************************************/

const closeFilPay = async (event) => {
  let id = event.pathParameters.id;


  let userData = await databaseManager.queryTable(PAIEMENTS_TABLE, id);

  if (userData.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `fil ${fileId} not found`,
      })
    );
  }


  if (userData[0].payment_requests != [] ) {

    let arr = userData[0].payment_requests

    for(var i = 0; i < arr.length; i++) {

      //update in process

      let paramName1 ="status"
      await  databaseManager.updateItemProcces(PROCESSUS_TABLE, arr[i].reference , paramName1, arr[i].decision )




      //update in payStatus

      let queryData = await databaseManager.queryTable(TABLE_NAME, arr[i].userId);
      
      if(queryData.length != []){

        let phrase = ` Demande de paiement ${arr[i].reference} de ${arr[i].amount} € est ${arr[i].decision} `


        await phrasePayoutUpdate (arr[i].userId ,queryData[0].created_date , phrase) ;



      }

  } 


  }



  //send notif to all payrequest and update in process 


  return databaseManager
    .updateconfirm(PAIEMENTS_TABLE,id)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `successfully update item : ${id}`,
        })
      );
    })
    .catch((err)=>{
      return sendResponse(
        400,
        JSON.stringify(err)
      );

    })
    

};




/****************************************unique iban num****************************************************/

const checkIban = async (event) => {
//55203253400646

const id = event.pathParameters.id;

let is_valid = IBAN.isValid(id); 

  if (is_valid == true) {


    return sendResponse(
      200,
      JSON.stringify({
        message: "format IBAN valide",
      })
    );


  }

  
  return sendResponse(
    200,
    JSON.stringify({
      message: "format IBAN invalide",
    })
  );

};



/****************************************minimum cashBack getter****************************************************/

const minCashBackgetter = async () => {
  let items;

  try {
     items = await databaseManager.queryTable(CONFIG_TABLE, "minAmount");

  } catch (err) {
    return sendResponse(
      500,
      JSON.stringify({
        message: err,
      })
    );
  }

  return sendResponse(
    200,
    JSON.stringify({
      minAmount: items[0].value,
    })
  );
};
/****************************************minimum cashBack getter****************************************************/

const internelMinPaygetter = async () => {
  let items;

  try {
     items = await databaseManager.queryTable(CONFIG_TABLE, "minAmount");

  } catch (err) {
    console.log(err)
}

  return items[0].value || 30 ;
};

/****************************************set minimum cashBack amount function ****************************************************/

const minCashBackSetter = async (event) => {
  const cash = event.pathParameters.id;



  return databaseManager
    .updateItemWithoutSort(CONFIG_TABLE, "minAmount", 'value',cash)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `MIN cashback become ${cash} successfully `,
        })
      );
    });
};




/****************************************unique iban num****************************************************/

const createPay = async () => {

  let end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  Date.now()
  let item = {
  id: now.toISOString(),
  status: "open",
  payment_requests : [],
   updated_date: null,
   doc_creating_date: now.toISOString(),
   doc_closing_date: end.toISOString(),
   path_doc: {
    "entite": "payment",
    "filename": `${now.toISOString().substring(0,10)}_${end.toISOString().substring(0,10)}.csv`,
    "fileType": "application/csv",
   },

};



try {
  await databaseManager.saveItem(PAIEMENTS_TABLE, item);

  return item.id

} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}

};


const payPresignedUrl = async (event) => {
  const doc = event.queryStringParameters;

  let entite = doc.entite;
  let filename = doc.filename;

  let object = [entite, filename].join("/");

  let params = {
    Bucket: 'beepmaker-pay',
    Key: object, 
    Expires: 600,
  };
  const url = await s3.getSignedUrlPromise("getObject", params);

  return sendResponse(200, JSON.stringify(url));
};


/****************************************bonus adder****************************************************/

const demandePay = async (event) => {

  const userId = event.pathParameters.id;

 let {iban,payment_amount } = JSON.parse(event.body);

 let userData = await databaseManager.queryTable(TABLE_NAME, userId);

if (userData.length === 0) {
  return sendResponse(
    404,
    JSON.stringify({
      message: `item with this id : ${userId} not found`,
    })
  );
}


if ( payment_amount > userData[0].bonus ){

  return sendResponse(
    200,
    JSON.stringify({
      error: "Solde insuffisant",
    })
  );


}
let minpay = await internelMinPaygetter();

if ( payment_amount < minpay ){

  return sendResponse(
    200,
    JSON.stringify({
      error: `Solde insuffisant , montant minimal est fixé à ${minpay}€ `,
    })
  );


}


  let fileId;

  let itemsOpen = await databaseManager.queryTableOpenPayAll(PAIEMENTS_TABLE);

  if (itemsOpen.length === 0) {
    fileId = await createPay();

}
let dateNow = now.toISOString()

  if (itemsOpen.length == 1) {
      if(itemsOpen[0].doc_closing_date < dateNow) {
        fileId = await createPay();
      }

      else fileId = itemsOpen[0].id;

}
if (itemsOpen.length > 1) {
    for(var i = 0; i < itemsOpen.length; i++) {
      if(itemsOpen[i].doc_closing_date > dateNow) {
        fileId = itemsOpen[i].id;
          break;
      }
      else fileId = await createPay();
  
  } 
}


//geting file id 
let billData = {};
let userbillinfo = userData[0].bilingInfo;

for(var i = 0; i < userbillinfo.length; i++) {
  if(userbillinfo[i].IBAN == iban) {
    billData = userbillinfo[i];
      break;
  } 
  else billData = {
    "currency": "notSetted",
    "IBAN": "notSetted",
    "holderFullName": "notSetted"
   }

} 

let uid =await nanoid(10)


let item = {  //table process
    id: `Beepmaker-Partners-${uid}`,
    processus_type: "payment",
    userId: userId ,
    metadata :{
        payment_status: "pending",
        payment_amount: payment_amount,
        progression: 0,
        rib: billData
    },
    closed :false,
    adminId: userId ,
    done_steps : [],  //payment_validation  payment_request
    updated_date: null,
    created_date: now.toISOString(),
    fileId: fileId,


};

try {
 let  processusId = await databaseManager.saveItem(PROCESSUS_TABLE, item);

//discount from balance and add stats



await PayoutUpdate (userId,userData[0].created_date , payment_amount ,item.id) ;


  let item2 = [{
    Nom_du_beneficiaire: billData.holderFullName,
    iban: iban,
    amount: payment_amount,
    currency : billData.currency,
    userId: userId ,
    decision  : "Valider",
    reference : processusId
   }
]


   let paramName ="payment_requests"

   await databaseManager.updateItemList(PAIEMENTS_TABLE, fileId, paramName, item2)
   
   return await  exportFile(fileId)
                .then((response) => {
                  return sendResponse(
                    200,
                    JSON.stringify({
                      message: "success",
                    })
                  );
                })
                .catch((err) => {
                  return sendResponse(
                    400,
                    JSON.stringify(err)
                  );
                });

                //updateFileId


} catch (err) {
  return sendResponse(
    500,
    JSON.stringify({
      message: err,
    })
  );
}





};



/********************************Paiement PayoutUpdate  ********************************************/

const PayoutUpdate = async (userId,createdDate,amount,ref) => {


    let paramValue2 = [{
      idpar: userId,
      date:now.toISOString(),
      desc:`Demande de paiement ${ref} de ${amount} € est en cours de traitement `,

    }];
    // impayée
    let paramName ="bonusStatus"

    await databaseManager.updateItemListQueue(TABLE_NAME, userId, createdDate, paramName, paramValue2)
          .catch((err) => {
            console.log(err)   
        });

    let bonusAmountInt = parseInt(amount)


    return await databaseManager.downVoteBonus(TABLE_NAME, userId, createdDate,bonusAmountInt)
    .then((response) => {
      return response
    })
    .catch((err) => {
    console.log(err)   
 });

};


/********************************Paiement PayoutUpdate  ********************************************/

const phrasePayoutUpdate = async (userId,createdDate,phrase) => {


    let paramValue2 = [{
      idpar: userId,
      date:now.toISOString(),
      desc:phrase,

    }];
    // impayée
    let paramName ="bonusStatus"

    return await databaseManager.updateItemListQueue(TABLE_NAME, userId, createdDate, paramName, paramValue2)
      .then((response) => {
        return response
      })
      .catch((err) => {
      console.log(err)   
  });

};




// /*************************************update biling info */

const addBilingInfo =async (event)=>{

  const itemId = event.pathParameters.id;

  let { country,currency,IBAN,bic,holderFullName } = JSON.parse(event.body);

  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }


let bilingId =await nanoid(10)

let paramValue2 =
  [{
    country:country,
    currency :currency,
    bic :bic,
    IBAN : IBAN,
    holderFullName : holderFullName ,
    bilingId : bilingId 

}]


let paramName ="bilingInfo"




  return await databaseManager.updateItemListQueue(TABLE_NAME, items[0].id, items[0].created_date, paramName, paramValue2)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}


// /*************************************update biling info */

const updateIBilingInfo =async (event)=>{

  const itemId = event.pathParameters.id;

  let { country,currency,IBAN,bic,holderFullName,bilingId } = JSON.parse(event.body);

  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let  arr =  items[0].bilingInfo;



  for(var i = 0; i < arr.length; i++) {
    if(arr[i].bilingId == bilingId) {
        arr[i].country =country;
        arr[i].currency =currency;
        arr[i].bic =bic;
        arr[i].IBAN = IBAN;
        arr[i].holderFullName =holderFullName ;
        break;
    }
     
}
  let paramName ="bilingInfo"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}

// /*************************************delete biling info */

const deleteBiling =async (event)=>{

  const itemId = event.pathParameters.id;

  let { IBAN } = JSON.parse(event.body);
  let items = await databaseManager.queryTable(TABLE_NAME, itemId);

  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }

  let  arr =  items[0].bilingInfo;



  for(var i = 0; i < arr.length; i++) {
    if(arr[i].IBAN == IBAN) {
        arr.splice(i, 1);
        break;
    }
}
  let paramName ="bilingInfo"

  return await  databaseManager.updateItem(TABLE_NAME, items[0].id, items[0].created_date, paramName, arr)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify(response)
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}



/****************************************bonus adder****************************************************/


const dataFormCsv = async (fileId) => {

  // const fileId = event.pathParameters.id;


      let userData = await databaseManager.queryTable(PAIEMENTS_TABLE, fileId);

    if (userData.length === 0) {
      return sendResponse(
        404,
        JSON.stringify({
          message: `item with this id : ${fileId} not found`,
        })
      );
    }


    return userData[0] ;



}


const updateDemandePay =async (event)=>{

  const referenceId = event.pathParameters.id;

  let { Nom_du_beneficiaire,amount,iban,decision } = JSON.parse(event.body);

  let items = await databaseManager.queryTable(PROCESSUS_TABLE, referenceId);


  //update pour ces element puis pass au autre table 
  if (items.length === 0) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${itemId} not found`,
      })
    );
  }
  items[0].metadata.payment_amount = amount;
  items[0].metadata.rib.owner_name = Nom_du_beneficiaire;
  items[0].metadata.rib.iban = iban;
  items[0].metadata.payment_status = decision
  
  console.log(items[0]);
  

  let paramName1 ="metadata"
  await  databaseManager.updateItemProcces(PROCESSUS_TABLE, referenceId, paramName1,  items[0].metadata)





  let itemsPenFil = await databaseManager.queryTable(PAIEMENTS_TABLE, items[0].fileId);

  
  let  arr =  itemsPenFil[0].payment_requests;



  for(var i = 0; i < arr.length; i++) {
    if(arr[i].reference == referenceId) {
        arr[i].amount = amount;
        arr[i].decision = decision;
        arr[i].iban = iban;
        arr[i].Nom_du_beneficiaire =Nom_du_beneficiaire ;
        break;
    }
}
  let paramName ="payment_requests"
  


   await  databaseManager.updateItemProcces(PAIEMENTS_TABLE, items[0].fileId, paramName, arr)
    
   
   
   return await exportFile(items[0].fileId)
   .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: "success",
        })
      );
    })   
    .catch((err) => {
      console.log(err)

      return sendResponse(
        400,
        JSON.stringify({message : err})
      );
    });

}




/****************************************bonus adder****************************************************/


const exportFile = async (fileId) => {

  let payData = await dataFormCsv(fileId)

  let data = payData.payment_requests

  if(data.length != 0){

    let cleanData   = data.reduce(function (res, option) {
      if (option.decision == "Valider") {
          res.push({ amount: option.amount, currency: option.currency, iban: option.iban, Nom_du_beneficiaire: option.Nom_du_beneficiaire , reference: option.reference});
      }
      return res;

    }, [])


  const fields = Object.keys(cleanData[0])
  const csv = new Parser({fields})

  const fileParse = csv.parse(cleanData)



let  uniquekey = payData.path_doc.filename ||await nanoid(10);

  let params = {
    Bucket: 'beepmaker-pay',
    Key: `pay/${uniquekey}`,
    Body: fileParse ,

}

try {
  let uploadPromise = await new AWS.S3().putObject(params).promise();
  return sendResponse(
    200,
    JSON.stringify({message :"Successfully uploaded data to bucket"})
  );
} catch (e) {
  console.log("Error uploading data: ", e);
  return sendResponse(
    400,
    JSON.stringify(e)
  );
}

}

}




/**************************************** reset beeps function ****************************************************/

const resetBeep = async (event) => {
  let items;
  let id = event.pathParameters.id;


  items = await databaseManager.queryTable(TABLE_NAME, id);

  if (!items) {
    return sendResponse(
      404,
      JSON.stringify({
        message: `item with this id : ${id} not found`,
      })
    );
  }

  let paramName = "beepscount";
  let newVal = 0;


 return   databaseManager.updateItem(TABLE_NAME, items[0].id,items[0].created_date, paramName, newVal)
    .then((response) => {
      return sendResponse(
        200,
        JSON.stringify({
          message: `Successfully reseted beeps counter with this id: ${id} `,
        })
      );
    });
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
