import * as uuid from "uuid";
import { DynamoDB, StepFunctions } from "aws-sdk";
// import AWS from "aws-sdk";
const dynamodb = new DynamoDB.DocumentClient();

export const addProduct = async (event) => {
  try {
    const { brand, product_name, quantity, price, flag } = JSON.parse(
      event.body
    );
    const newProduct = {
      id: uuid.v1(),
      brand: brand,
      product_name: product_name,
      quantity: quantity,
      price: price,
      total_price: price * quantity,
      flag: flag,
      discount: 0,
      tax: 0,
      amount_payable: 0,
    };
    console.log("New Product is", newProduct);

    var params = {
      stateMachineArn:
        "arn:aws:states:ap-south-1:800331105397:stateMachine:addProductStep",
      input: JSON.stringify({
        data: newProduct,
        message: "New product added successfully",
      }),
    };

    var stepfunctions = new StepFunctions();

    let stpData : StepFunctions.StartExecutionOutput = await stepfunctions?.startExecution(params).promise();
    console.log("stpData is " + stpData);

    await dynamodb
      .put({
        TableName: "productTable",
        Item: newProduct,
      })
      .promise();

    //sqs
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: "Product added successfully !",
      }),
    };

    return response;

  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
