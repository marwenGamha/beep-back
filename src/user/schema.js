


const authSchema = {
  type: "object",
  required: ["email","group","responsableFullName","companyName","siretNumber","phone","fieldOfActivity","typeOfCompany"],
    properties: {
      "email": {type: "string", format:"email"},
      "group": {type: "string" , enum:["admin","superAdmin"]},
      "responsableFullName": {type: "string","minLength":1,"maxLength":50},
      "companyName": {type: "string","minLength":1,"maxLength":50},
      "siretNumber": {type: "integer","minimum":9999999999999,"maximum":99999999999999}, 
      "phone": {type: "object"},
      "fieldOfActivity": {type: "string","minLength":1,"maxLength":50},
      "typeOfCompany": {type: "string","minLength":1,"maxLength":50},
      "code": {type: "string"},

    },
    additionalProperties: false


}





const commercialCompanyAuthSchema = {
  type: "object",
  required: ["email","group","responsableFullName","companyName","siretNumber","phone","fieldOfActivity","typeOfCompany","type"],
    properties: {
      "email": {type: "string", format:"email"},
      "group": {type: "string" , enum:["commercial"]},
      "responsableFullName": {type: "string","minLength":1,"maxLength":50},
      "companyName": {type: "string","minLength":1,"maxLength":50},
      "siretNumber": {type: "integer","minimum":9999999999999,"maximum":99999999999999}, 
      "phone": {type: "object"},
      "fieldOfActivity": {type: "string","minLength":1,"maxLength":50},
      "typeOfCompany": {type: "string","minLength":1,"maxLength":50},
      "type":  {type: "string" , enum:["company","individual"]},

    },
    additionalProperties: false


}

const commercialindivAuthSchema = {
  type: "object",
  required: ["email","group","fullName","type"],
    properties: {
      "email": {type: "string", format:"email"},
      "group": {type: "string" , enum:["commercial"]},
      "fullName": {type: "string","minLength":1,"maxLength":50},
      "phone": {type: "object"},
      "type":  {type: "string" , enum:["company","individual"]},

    },
    additionalProperties: false


}

const userauthSchema = {
  type: "object",
  required: ["email","group","companyId"],
    properties: {
      "email": {type: "string", format:"email"},
      "group": {type: "string" , enum:["user"]},
      "companyId": {type: "string","minLength":1,"maxLength":50},
      "queue": {type: "string"},
      "subQueue": {type: "string"},
      "fullName": {type: "string"},
      "phone": {type: "object"},


    },
    additionalProperties: false


}
const superAdminSchema = {
  type: "object",
  required: ["email","group","fullName"],
    properties: {
      "email": {type: "string", format:"email"},
      "group": {type: "string" , enum:["superAdmin"]},
      "fullName": {type: "string"},


    },
    additionalProperties: false


}
const saveDbSchema = {
  type: "object",
  required: ["entite","Type","filename","fileType"],
    properties: {
      "entite": {type: "string","minLength":1,"maxLength":50},
      "Type": {type: "string" , enum:["queue","logo","menu"]},
      "filename": {type: "string","minLength":1,"maxLength":50},
      "fileType": {type: "string","minLength":1,"maxLength":50},
      "idQueue": {type: "string"},


    },
    additionalProperties: false


}




module.exports ={
  authSchema,
  saveDbSchema,
  userauthSchema,
  superAdminSchema,
  commercialindivAuthSchema,
  commercialCompanyAuthSchema
}
