var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  var response, params;

  if (event.email != undefined) {
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
  } else {
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
        let deleteParams = {
          TableName: "customers",
          Key: {
            id: `${data.Items[0].id}`,
          },
        };
        dynamo.delete(deleteParams, function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
            response = {
              statusCode: 400,
              body: "Error during database operation!",
            };
            callback(null, response);
          } else {
            console.log("Customer deleted!");
            response = {
              statusCode: 202,
              body: "Customer deleted!",
            };
            callback(null, response);
          }
        });
      } else {
        response = {
          statusCode: 404,
          body: "Customer not found!",
        };
        callback(null, response);
      }
    }
  });
};
