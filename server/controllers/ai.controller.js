import { HumanMessage } from "@langchain/core/messages";
import { agent } from "../utils/agent.js";
import axios from "axios";

export const generate = async (req, res) => {
  const { prompt } = req.body;
  // console.log(prompt);

  try {
    const responce = await agent.invoke({
      messages: [new HumanMessage(prompt)],
    });
    // console.log(responce);
    res.status(200).json({ res: responce?.messages[1]?.content });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const makeCall = async (req, res) => {

  const { name, mobile_no } = req.body;
  try {
    const responce = await axios.post(
      "https://rohitanshu.app.n8n.cloud/webhook-test/4d0f431f-84f3-4a01-832d-44ce988d4cf0",
      {
        body: {
          name,
          mobile_no,
        },
      }
    );
  } catch (error) {}

//   const url = 'https://api.bolna.ai/call';
// const options = {
//   method: 'POST',
//   headers: {Authorization: 'Bearer bn-20d0be9c793a48baafdb81a5f2342c1f', 'Content-Type': 'application/json'},
//   body: JSON.stringify({
//     agent_id: "9e6d5ca1-e789-44b9-99c7-ee9c6fed50d4",
//     recipient_phone_number: mobile_no,
//     from_phone_number: "+16319194136",
//   })
// };

// try {
//   const response = await fetch(url, options);
//   const data = await response.json();
//   console.log(data);
// } catch (error) {
//   console.error(error);
// }


};
