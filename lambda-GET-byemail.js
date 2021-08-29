var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  var response,
    params = {
      TableName: "customers",
    };

  if (event.email != undefined) {
    if (event.email != "*") {
      params = {
        TableName: "customers",
        FilterExpression: "#e = :email",
        ExpressionAttributeNames: {
          "#e": "email",
        },
        ExpressionAttributeValues: {
          ":email": `${event.email}`,
        },
      };
    }
  } else if (event.payload != undefined) {
    if (event.payload.Item.email != "*") {
      params = {
        TableName: "customers",
        FilterExpression: "#e = :email",
        ExpressionAttributeNames: {
          "#e": "email",
        },
        ExpressionAttributeValues: {
          ":email": `${event.payload.Item.email}`,
        },
      };
    }
  }

  dynamo.scan(params, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      response = {
        statusCode: 400,
        body: "Error during database operation!",
      };
      callback(null, response);
    } else {
      if (data.Count > 0) {
        console.log(data);
        response = {
          statusCode: 200,
          body: data.Items,
        };
        callback(null, response);
      } else {
        response = {
          statusCode: 404,
          body: "No customer found!",
        };
        callback(null, response);
      }
    }
  });
};
