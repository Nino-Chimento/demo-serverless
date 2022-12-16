const { DynamoDB } = require("aws-sdk");

exports.getClient = () => {
  let config = {
    apiVersion: "2012-08-10",
    region: "eu-west-1",
  };
  if (process.env.APP_ENV === "local") {
    config = {
      ...config,
      endpoint: "http://dynamodb:8000",
      accessKeyId: "YOURKEY",
      secretAccessKey: "YOURSECRET",
    };
  }
  return new DynamoDB.DocumentClient(config);
};
