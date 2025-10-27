const url = "https://api.bolna.ai/call";
const options = {
  method: "POST",
  headers: {
    Authorization: "Bearer bn-b8d5dbe9effd4ef5b502e8972171557a",
    "Content-Type": "application/json",
  },
  body: {
    agent_id: "9e6d5ca1-e789-44b9-99c7-ee9c6fed50d4",
    recipient_phone_number: "+917008552247",
    from_phone_number: "+16319194136",
  },
};

try {
  const response = await fetch(url, options);
  console.log(response)
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
