var AWS = require("aws-sdk");
var dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  var response,
    params = {
      TableName: "customers",
    };

  if (event.phone != undefined) {
    if (event.phone != "*") {
      params = {
        TableName: "customers",
        FilterExpression: "#p = :phone",
        ExpressionAttributeNames: {
          "#p": "phoneNumber",
        },
        ExpressionAttributeValues: {
          ":phone": `${event.phone}`,
        },
      };
    }
  } else if (event.payload != undefined) {
    if (event.payload.Item.phoneNumber != "*") {
      params = {
        TableName: "customers",
        FilterExpression: "#p = :phone",
        ExpressionAttributeNames: {
          "#p": "phoneNumber",
        },
        ExpressionAttributeValues: {
          ":phone": `${event.payload.Item.phoneNumber}`,
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
