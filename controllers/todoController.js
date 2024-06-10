import todoModel from "../models/todoSchema.js";
import userModel from "../models/userSchema.js";
import crypto from "crypto"


// Define the algorithm and secret key for encryption
const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update('bilal@123').digest('base64').substr(0, 32); // Ensure 32 bytes key
const iv = crypto.randomBytes(16); // Initialization vector

// Encrypt function
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

// Decrypt function
const decrypt = (text) => {
  const [ivHex, encryptedText] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};





const createTodo = async (req, res) => {
  const { desc, status, adminName } = req.body;
  if (!desc || !adminName) {
    return res.json({
      data: null,
      status: false,
      message: "Required fields are missing",
    });
  }

  const checkUserStatus = await userModel.findOne({ admin_name: adminName }).any_active_req;
  if (checkUserStatus) {
    return res.json({
      data: null,
      status: false,
      message: "Hit after pending request",
    });
  }

  const encryptedDesc = encrypt(desc);

  const objToSend = {
    desc: encryptedDesc,
    status,
    admin_name: adminName,
  };

  try {
    const db_resp = await todoModel.create(objToSend);
    const decryptedResp = {
      ...db_resp._doc,
      desc: decrypt(db_resp.desc), // Decrypt before sending to client
    };
    res.json(decryptedResp);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create to-do' });
  }
};

const getTodos = async (req, res) => {
  const { adminName } = req.params;

  if (adminName !== req.userEmail) {
    return res.status(403).json({ message: 'You are not authorized to fetch these to-dos.' });
  }

  const todos = await todoModel.find({ admin_name: adminName });

  // Decrypt the description for each to-do
  const decryptedTodos = todos.map(todo => {
    return {
      ...todo._doc,
      desc: decrypt(todo.desc)
    };
  });

  res.json({
    data: decryptedTodos,
    status: true,
  });
};



// const getTodos = async(req,res)=>{

//   const {adminName}=req.params
//   console.log(req.params.id,req.userEmail)
//   if (req.params.id !==  req.userEmail) {
//     return res.status(403).json({ message: 'You are not authorized to fetch these to-dos.' });
//   }

//   const getTodos= await todoModel.find({admin_name:adminName})
//   const decryptedTodos = getTodos.map(todo => {
//     return {
//       ...todo._doc,
//       desc: decrypt(todo.desc)
//     }; });

//   res.json({
//     data:decryptedTodos,
//     status:true,
//   })
// }

// const createTodo = async (req, res) => {
//   const { desc, status, adminName } = req.body;
//   console.log(adminName,req.userEmail)
//   if (adminName !== req.userEmail) {
//     return res.status(403).json({ message: 'You does not have rights to create todo for this user! multiple calls may cause u black listed bruh' });
//   }
//   if (!desc || !adminName) {
//     res.json({
//       data: null,
//       status: false,
//       message: "required fields are missing",
//     });
//     return;
//   }
//   //verify user middle ware mae hoga idhar krnae ke zaroorat nahi hae
//   const checkUserStatus = await userModel.findOne(adminName).any_active_req;
//   console.log(checkUserStatus);

//   if (checkUserStatus) {
//     res.json({
//       data: null,
//       status: false,
//       message: "hit after pending req",
//     });
//     return;
//   }

//   const objToSend = {
//     desc: encrypt(desc),
//     status,
//     admin_name: adminName,
//   };
//   const db_resp=await todoModel.create(objToSend);
//   res.json(db_resp);
// };
//api mae pending any active req ke logic lekhnae ke koi zaroorat nahi hae middleware mae likhain gae

const changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(status)
  if (status!==1 && status!==0) {
    res.json({
      data: null,
      status: false,
      message: "req fields are missing",
    });
    return;
  }
  const data= await todoModel.findOneAndUpdate({ _id: id }, { status }, { new: true });
  res.json(data);
};

const updateDesc = async (req, res) => {
  const { id } = req.params;
  const { desc } = req.body;
  if (!desc || !id) {
    return res.json({
      message: "Required fields are missing",
      data: null,
      status: false,
    });
  }

  // Encrypt the new description
  const encryptedDesc = encrypt(desc);

  try {
    await todoModel.findOneAndUpdate({ _id: id }, { desc: encryptedDesc });
    res.json({
      message: "To-do updated!",
      status: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update to-do",
      status: false,
    });
  }
};
const tmpDeleteTodo = async (req, res) => {
  const { id } = req.params;
  const { method } = req.body;

  if (!id || !method) {
    console.log(id,method)
    return res.status(400).json({ message: "Missing ID or method in request" });
  }

  try {
    let updateQuery;
    let message;

    switch (method) {
      case "recover":
        updateQuery = { is_deleted: false };
        message = "Todo recovered";
        break;
      case "delete":
        updateQuery = { is_deleted: true };
        message = "Todo deleted temporarily";
        break;
      default:
        return res.status(400).json({ message: "Unknown update method" });
    }

    await todoModel.findOneAndUpdate({ _id: id }, updateQuery);
    res.json({ message });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteAllTemp = async (req, res) => {
  const { id } = req.params;
    if (id !== req.userEmail) {
      return res.status(403).json({ message: 'You are not authorized to delete these to-dos.' });
    }
  try {
    await todoModel.updateMany(
      { admin_name: id },
      { $set: { is_deleted: true } }
    );
    res.status(200).json({ message: "Todos deleted temporarily" });
  } catch (error) {
    console.error("Error deleting todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



export { createTodo, changeStatus, updateDesc, tmpDeleteTodo,deleteAllTemp,getTodos };
