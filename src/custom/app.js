const pug = require("pug");



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


exports.lambdaHandler = async (event, context) => {
  console.log(event)

  switch (event.triggerSource) {
    case "CustomMessage_SignUp": //Sign-up trigger whenever a new user signs him/herself up.
        return sign_up_message(event);
    case "CustomMessage_AdminCreateUser": //When the user is created with adminCreateUser() API
        return admin_create_user_message(event);
    case "CustomMessage_ForgotPassword": //Forgot password request initiated by user
        return forgot_password(event);
    // case "CustomMessage_ResendCode": //When user requests the code again.
    //     return resend_code_message(event)
    // case "CustomMessage_UpdateUserAttribute": //Whenever the user attributes are updated
    //     return update_user_attribute_message(event)
    // case "CustomMessage_VerifyUserAttribute": //Verify mobile number/email
    //     return verify_user_attribute(event)
    // case "CustomMessage_Authentication": //MFA authenitcation code.
    //     return authenitcation_message(event)

    default:
      return event
  }
  

  
}

const sign_up_message = async (event) => {

  let email = event.request.userAttributes.email;
  let code = event.request.codeParameter;
  console.log(event.request.usernameParameter)

  const html1 = pug.renderFile(`${__dirname}/template/signUp.pug`, {
    email: email, 
    code: code, 
  });

  event.response = {
    emailSubject: "Confirmation du compte",
    emailMessage: html1
}
return event

}
const admin_create_user_message = async (event) => {
  console.log("admin create user event", event)

  let code = event.request.codeParameter;
  let userName = event.request.usernameParameter;


  const html2 = pug.renderFile(`${__dirname}/template/adminCreUser.pug`, {
    userName: userName, 
    code: code, 
  });

  event.response = {
    emailSubject: "Votre mot de passe temporaire",
    emailMessage: html2,
}
return event

}
const forgot_password = async (event) => {

  let email = event.request.userAttributes.email;
  let code = event.request.codeParameter;

  const html3 = pug.renderFile(`${__dirname}/template/forgotPass.pug`, {
    email: email, 
    code: code, 
  });

  event.response = {
    emailSubject: "Mot de passe oublié ?",
    emailMessage: html3
}
return event

}

