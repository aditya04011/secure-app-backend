import mongoose from "mongoose";
// Adjust these paths based on your project structure
import Role from "../core/security/models/roles.model.js";
import Project from "../modules/taskmanagement/models/project.model.js";
import User from "../core/security/models/user.model.js";
import Profile from "../modules/common/models/profile.model.js"; // Assuming Profile schema is here
import loggingService from "../services/logging.service.js"; // Optional: use your logger

// Initialize a logger (optional, you can use console.log)
const logger = loggingService?.getModuleLogger("Global-Utils","User Migration Script") || {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.log
};

const oldUsersJson = `
[{
  "_id": {
    "$oid": "67dad60bac8b905af12d0739"
  },
  "fullname": "Super Admin",
  "username": "superadmin-isc",
  "email": "superadmin@isc.guru",
  "password": "Welcome1",
  "phoneNumber": "9676855959",
  "designation": "Super Admin",
  "role": "owner",
  "permissions": {},
  "branch": [
    "rajajiNagar1stBlock",
    "rajajiNagar4thBlock",
    "rajajiNagarPUC",
    "malleshwaram",
    "malleshwaramPUC",
    "basaveshwarNagar",
    "basaveshwarNagarPUC",
    "nagarbhavi"
  ],
  "isActive": true,
  "version": 1,
  "createdAt": {
    "$date": "2025-03-19T14:34:51.768Z"
  },
  "updatedAt": {
    "$date": "2025-03-19T14:34:51.768Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67dadbabecd2931768d0e7b8"
  },
  "fullname": "Madhusudhan Dhayalan",
  "username": "Madhusudhan",
  "email": "madhu@isc.guru",
  "password": "Innovative01$",
  "phoneNumber": "9845118711",
  "designation": "Director(Super Admin)",
  "role": "owner",
  "permissions": {},
  "branch": [
    "rajajiNagar1stBlock",
    "rajajiNagar4thBlock",
    "rajajiNagarPUC",
    "malleshwaram",
    "malleshwaramPUC",
    "basaveshwarNagar",
    "basaveshwarNagarPUC",
    "nagarbhavi"
  ],
  "isActive": true,
  "version": 1,
  "createdAt": {
    "$date": "2025-03-19T14:58:51.797Z"
  },
  "updatedAt": {
    "$date": "2025-03-19T14:58:51.797Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67dbd9ddc9c3c43ffb7ee8ee"
  },
  "fullname": "Divya",
  "username": "Divya",
  "email": "divya@isc.guru",
  "password": "Innovative01$",
  "phoneNumber": "*",
  "designation": "Accountant",
  "role": "accountant",
  "permissions": {},
  "branch": [
    "rajajiNagar1stBlock",
    "rajajiNagar4thBlock",
    "rajajiNagarPUC",
    "malleshwaram",
    "malleshwaramPUC",
    "basaveshwarNagar",
    "basaveshwarNagarPUC",
    "nagarbhavi"
  ],
  "isActive": true,
  "version": 1,
  "createdAt": {
    "$date": "2025-03-20T09:03:25.437Z"
  },
  "updatedAt": {
    "$date": "2025-03-20T09:03:25.437Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67dbe23ac9c3c43ffb7ee8fb"
  },
  "fullname": "Rakesh R",
  "username": "Rakesh R",
  "email": "rakesh@isc.guru",
  "password": "Innovative01$",
  "phoneNumber": "7676116129",
  "designation": "Manager",
  "role": "manager",
  "permissions": {},
  "branch": [
    "basaveshwarNagar"
  ],
  "isActive": true,
  "version": 1,
  "createdAt": {
    "$date": "2025-03-20T09:39:06.933Z"
  },
  "updatedAt": {
    "$date": "2025-03-20T09:39:06.933Z"
  },
  "__v": 0
},
{
  "_id": {
    "$oid": "67dbe263c9c3c43ffb7ee901"
  },
  "fullname": "Karthik S",
  "username": "Karthik S",
  "email": "karthiks@isc.guru",
  "password": "Innovative01$",
  "phoneNumber": "89042 88507",
  "designation": "Teacher",
  "role": "faculty",
  "permissions": {},
  "branch": [
    "basaveshwarNagar"
  ],
  "isActive": true,
  "version": 1,
  "createdAt": {
    "$date": "2025-03-20T09:39:47.097Z"
  },
  "updatedAt": {
    "$date": "2025-03-20T09:39:47.097Z"
  },
  "__v": 0
},
{
    "_id": { "$oid": "67dbe272c9c3c43ffb7ee907" },
    "fullname": "Vishal Dhruva S",
    "username": "Vishal Dhruva",
    "email": "vishal@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9741314958",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "basaveshwarNagar" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:40:02.436Z" },
    "updatedAt": { "$date": "2025-03-20T09:40:02.436Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe287c9c3c43ffb7ee90d" },
    "fullname": "Pradeep A Bhat",
    "username": "Pradeep Bhat",
    "email": "pradeepbhat@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9731268965",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "basaveshwarNagar" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:40:23.542Z" },
    "updatedAt": { "$date": "2025-03-20T09:40:23.542Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe29bc9c3c43ffb7ee913" },
    "fullname": "Nandan G",
    "username": "Nandan",
    "email": "nandan@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9738471174",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "basaveshwarNagar" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:40:43.550Z" },
    "updatedAt": { "$date": "2025-03-20T09:40:43.550Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe2a9c9c3c43ffb7ee919" },
    "fullname": "Santosh Gowda",
    "username": "Santosh Gowda",
    "email": "santhoshgowda@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9590761048",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "basaveshwarNagar" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:40:57.511Z" },
    "updatedAt": { "$date": "2025-03-20T09:40:57.511Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe2bac9c3c43ffb7ee91f" },
    "fullname": "Mahabaleshwara Gadde",
    "username": "Mahabaleshwara",
    "email": "mahabaleshwara@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9481451034",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:41:14.042Z" },
    "updatedAt": { "$date": "2025-03-20T09:41:14.042Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe2d1c9c3c43ffb7ee925" },
    "fullname": "Manesh B Jain",
    "username": "Manaesh Jain",
    "email": "maneshjain@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "8217532407",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:41:37.264Z" },
    "updatedAt": { "$date": "2025-03-20T09:41:37.264Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe2fcc9c3c43ffb7ee92b" },
    "fullname": "Priyanka Pattnayak",
    "username": "Priyanka",
    "email": "priyanka@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "6361755730",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:42:20.412Z" },
    "updatedAt": { "$date": "2025-03-20T09:42:20.412Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe30fc9c3c43ffb7ee931" },
    "fullname": "Lokesh",
    "username": "Lokesh",
    "email": "lokesh@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9481632955",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:42:39.368Z" },
    "updatedAt": { "$date": "2025-03-20T09:42:39.368Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe31ec9c3c43ffb7ee937" },
    "fullname": "Keerthana",
    "username": "Keerthana",
    "email": "keerthana@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "8660618235",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:42:54.880Z" },
    "updatedAt": { "$date": "2025-03-20T09:42:54.880Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe3e8c9c3c43ffb7ee93d" },
    "fullname": "Parthasarathy V",
    "username": "Parthasarathy",
    "email": "partha@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9380002834",
    "designation": "Assistant Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:46:16.723Z" },
    "updatedAt": { "$date": "2025-03-20T09:46:16.723Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe403c9c3c43ffb7ee943" },
    "fullname": "D. Seshagiri",
    "username": "Seshagiri",
    "email": "sesh@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "8861478087",
    "designation": "Manager",
    "role": "manager",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:46:43.185Z" },
    "updatedAt": { "$date": "2025-03-20T09:46:43.185Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe414c9c3c43ffb7ee949" },
    "fullname": "Mr. Praveen",
    "username": "Praveen",
    "email": "praveen@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Branch Head",
    "role": "manager",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:47:00.788Z" },
    "updatedAt": { "$date": "2025-03-20T09:47:00.788Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe427c9c3c43ffb7ee94f" },
    "fullname": "Naveen",
    "username": "Naveen",
    "email": "naveen@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9880271726",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:47:19.991Z" },
    "updatedAt": { "$date": "2025-03-20T09:47:19.991Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe439c9c3c43ffb7ee955" },
    "fullname": "Jeethendra S",
    "username": "Jeethendra",
    "email": "jeethendra@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "7892745567",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:47:37.029Z" },
    "updatedAt": { "$date": "2025-03-20T09:47:37.029Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe449c9c3c43ffb7ee95b" },
    "fullname": "Ravikumar Sv",
    "username": "Ravi kumar",
    "email": "ravikumar@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9164489618",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:47:53.791Z" },
    "updatedAt": { "$date": "2025-03-20T09:47:53.791Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe459c9c3c43ffb7ee961" },
    "fullname": "Saravana",
    "username": "Saravana",
    "email": "saravana@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:48:09.931Z" },
    "updatedAt": { "$date": "2025-03-20T09:48:09.931Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe465c9c3c43ffb7ee967" },
    "fullname": "Madhu Vy",
    "username": "Madhu VY",
    "email": "madhuvy@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:48:21.885Z" },
    "updatedAt": { "$date": "2025-03-20T09:48:21.885Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe521c9c3c43ffb7ee96d" },
    "fullname": "Suhas S",
    "username": "Suhas",
    "email": "suhas@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9686492761",
    "designation": "Assistant Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:51:29.363Z" },
    "updatedAt": { "$date": "2025-03-20T09:51:29.363Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe5a2c9c3c43ffb7ee973" },
    "fullname": "Kiran V",
    "username": "Karan V",
    "email": "kiranv@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9902701501",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar1stBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:53:38.569Z" },
    "updatedAt": { "$date": "2025-03-20T09:53:38.569Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe5b5c9c3c43ffb7ee979" },
    "fullname": "Mr. Pradeep",
    "username": "Pradeep",
    "email": "pradeep@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Branch Head, Teacher, Head of Brand & Marketing",
    "role": "manager",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:53:57.269Z" },
    "updatedAt": { "$date": "2025-03-20T09:53:57.269Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe5c2c9c3c43ffb7ee97f" },
    "fullname": "Ms. Nimisha",
    "username": "Nimisha",
    "email": "nimisha@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:54:10.951Z" },
    "updatedAt": { "$date": "2025-03-20T09:54:10.951Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe5cfc9c3c43ffb7ee985" },
    "fullname": "Ms. Sanjana",
    "username": "Sanjana",
    "email": "sanjana@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:54:23.589Z" },
    "updatedAt": { "$date": "2025-03-20T09:54:23.589Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe5dfc9c3c43ffb7ee98b" },
    "fullname": "Mrs. Bhuvaneshwari",
    "username": "Bhuvaneshwari",
    "email": "bhuvaneshvari@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9739129919",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:54:39.936Z" },
    "updatedAt": { "$date": "2025-03-20T09:54:39.936Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe5f3c9c3c43ffb7ee991" },
    "fullname": "Mr. Lohith",
    "username": "Lohith",
    "email": "lohith@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "*",
    "designation": "Manager",
    "role": "manager",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:54:59.829Z" },
    "updatedAt": { "$date": "2025-03-20T09:54:59.829Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe603c9c3c43ffb7ee997" },
    "fullname": "Mr. Satish Bhat",
    "username": "Satish Bhat",
    "email": "sathishbhat@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9448674123",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:55:15.384Z" },
    "updatedAt": { "$date": "2025-03-20T09:55:15.384Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe69bc9c3c43ffb7ee99d" },
    "fullname": "Ms. Keerthi",
    "username": "Keerthi",
    "email": "keerthi@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "8660826614",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "rajajiNagar4thBlock" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T09:57:47.400Z" },
    "updatedAt": { "$date": "2025-03-20T09:57:47.400Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe73fc9c3c43ffb7ee9a3" },
    "fullname": "Mr. Santhosh",
    "username": "Santhosh",
    "email": "santhosh@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9663453436",
    "designation": "Branch Head & Teacher",
    "role": "manager",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:00:31.784Z" },
    "updatedAt": { "$date": "2025-03-20T10:00:31.784Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe752c9c3c43ffb7ee9a9" },
    "fullname": "Mr. Likith",
    "username": "Likith",
    "email": "likith@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9844950962",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:00:50.442Z" },
    "updatedAt": { "$date": "2025-03-20T10:00:50.442Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe764c9c3c43ffb7ee9af" },
    "fullname": "Mr. Mohan",
    "username": "Mohan",
    "email": "mohan@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9035730990",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:01:08.419Z" },
    "updatedAt": { "$date": "2025-03-20T10:01:08.419Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe7fac9c3c43ffb7ee9b5" },
    "fullname": "Mr. Kiran",
    "username": "Kiran",
    "email": "kiran@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9902701501",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:03:38.669Z" },
    "updatedAt": { "$date": "2025-03-20T10:03:38.669Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe813c9c3c43ffb7ee9bb" },
    "fullname": "Mr. Achyut Rao Bapat",
    "username": "Achyut Rao",
    "email": "achyut@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "7795130373",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:04:03.354Z" },
    "updatedAt": { "$date": "2025-03-20T10:04:03.354Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe829c9c3c43ffb7ee9c1" },
    "fullname": "Mr. Nandeesh",
    "username": "Nandeesh",
    "email": "nadeesh@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9986181873",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:04:25.263Z" },
    "updatedAt": { "$date": "2025-03-20T10:04:25.263Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe839c9c3c43ffb7ee9c7" },
    "fullname": "Ms. Hemalatha",
    "username": "Hemalatha",
    "email": "hemalatha@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9535714099",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:04:41.813Z" },
    "updatedAt": { "$date": "2025-03-20T10:04:41.813Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe84ac9c3c43ffb7ee9cd" },
    "fullname": "Mr. Naveen S",
    "username": "Naveen S",
    "email": "naveens@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9880271726",
    "designation": "Teacher",
    "role": "faculty",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:04:58.110Z" },
    "updatedAt": { "$date": "2025-03-20T10:04:58.110Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe85ec9c3c43ffb7ee9d3" },
    "fullname": "Mr. Shivaling",
    "username": "Shivaling",
    "email": "shivaling@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9845302271",
    "designation": "Manager",
    "role": "manager",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:05:18.834Z" },
    "updatedAt": { "$date": "2025-03-20T10:05:18.834Z" },
    "__v": 0
  },
  {
    "_id": { "$oid": "67dbe870c9c3c43ffb7ee9d9" },
    "fullname": "Mr. Jayanth",
    "username": "Jayanth",
    "email": "jayanth@isc.guru",
    "password": "Innovative01$",
    "phoneNumber": "9380434847",
    "designation": "Manager",
    "role": "manager",
    "permissions": {},
    "branch": [ "nagarbhavi" ],
    "isActive": true,
    "version": 1,
    "createdAt": { "$date": "2025-03-20T10:05:36.618Z" },
    "updatedAt": { "$date": "2025-03-20T10:05:36.618Z" },
    "__v": 0
  }
]
`;
// --- End of JSON data ---

// Helper function to split full name into first and last name
const splitFullName = (fullname) => {
  if (!fullname || typeof fullname !== "string") {
    return { firstName: "Unknown", lastName: "User" };
  }
  const parts = fullname.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : ""; // Handle single names - assign empty lastName
  return { firstName, lastName: lastName || firstName }; // If lastName is empty, use firstName again or adjust as needed
};

/**
 * Maps old role/designation/username to the new Profile type enum.
 * @param {string} role - The old role string.
 * @param {string} designation - The old designation string.
 * @param {string} username - The old username string.
 * @returns {string} The corresponding Profile type from the enum.
 */
const mapRoleToProfileType = (role, designation, username) => {
  const lowerRole = role?.toLowerCase();
  const lowerDesignation = designation?.toLowerCase() || ""; // Ensure designation is a string

  // --- Specific Requirements ---
  // 1. Handle 'superadmin-isc' -> 'superadmin'
  if (username === "superadmin-isc") {
    return "superadmin"; // Specific user mapping
  }
  // 2. Handle 'owner' role -> 'owner'
  if (lowerRole === "owner") {
    return "owner"; // Owner role maps directly to owner type
  }

  // --- Role-based Mapping ---
  if (lowerRole === "manager") {
    return "manager";
  }
  if (lowerRole === "faculty") {
    return "faculty";
  }
  if (lowerRole === "student") {
    return "student";
  }
  if (lowerRole === "parent") {
    return "parent";
  }
  if (lowerRole === "guardian") {
    return "guardian";
  }
  // Handle 'accountant' specifically if needed, map to 'staff'
  if (lowerRole === "accountant") {
    return "staff";
  }

  // --- Designation-based Mapping (if role didn't match) ---
  if (
    lowerDesignation.includes("teacher") ||
    lowerDesignation.includes("faculty")
  ) {
    return "faculty";
  }
  if (
    lowerDesignation.includes("manager") ||
    lowerDesignation.includes("head") || // e.g., "Branch Head"
    lowerDesignation.includes("director") // e.g., "Director"
  ) {
    // Check if they are already owner type from role check above
    if (lowerRole !== "owner") {
      // Avoid overriding owner type if role was owner
      return "manager";
    }
  }
  if (lowerDesignation.includes("receptionist")) {
    return "receptionist";
  }
  if (lowerDesignation.includes("staff")) {
    // Check if designation explicitly mentions staff
    return "staff";
  }

  // --- Default Fallback ---
  // If no specific match, classify as 'staff' or 'others'. 'staff' is often suitable for employees.
  // Consider 'others' if 'staff' doesn't fit well.
  logger.warn(
    `No specific profile type mapping found for role='${role}', designation='${designation}', username='${username}'. Defaulting to 'staff'.`
  );
  return "staff";
};

// Main migration function
const migrateOldUsers = async () => {
  logger.info("Starting user migration process...");
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    const oldUsers = JSON.parse(oldUsersJson);
    logger.info(`Attempting to migrate ${oldUsers.length} users from JSON.`);

    // Pre-fetch all existing roles into a map for faster lookup
    const rolesList = await Role.find({});
    const rolesMap = new Map(rolesList.map((r) => [r.roleName, r._id]));
    logger.debug(`Loaded ${rolesMap.size} roles into map.`);

    for (const oldUser of oldUsers) {
      const email = oldUser.email;
      logger.info(`Processing user: ${email} (Username: ${oldUser.username})`);

      try {
        // 1. Check if User already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          logger.warn(`User with email ${email} already exists. Skipping.`);
          skippedCount++;
          continue; // Skip to the next user
        }

        // 2. Find the Role ObjectId (for the User model's roles array)
        const roleName = oldUser.role;
        const roleId = rolesMap.get(roleName);
        if (!roleId) {
          logger.error(
            `Role '${roleName}' not found in the database for user ${email}. Skipping user creation.`
          );
          // Optionally create a default role or handle this case differently
          errorCount++;
          continue; // Skip user if role doesn't exist
        }
        logger.debug(`Role found for ${email}: ${roleName} -> ${roleId}`);

        // 3. Prepare and Create the User
        logger.debug(`Preparing user data for ${email}.`);

        // WARNING: Storing plain text password as requested. Hashing is strongly recommended.
        const plainPassword = oldUser.password;
        if (plainPassword === "Welcome1" || plainPassword === "Innovative01$") {
          logger.warn(
            `Using known insecure password for ${email}. Hashing is critical.`
          );
        }

        // Map branch names to the required roles structure
        const userRoles =
          oldUser.branch && Array.isArray(oldUser.branch)
            ? oldUser.branch.map((branchName) => ({
                branchName,
                roleId // Use the found roleId
              }))
            : []; // Handle cases where branch might be missing or not an array

        if (userRoles.length === 0) {
          logger.warn(
            `No branches found for user ${email}. User role assignment will be empty.`
          );
        }

        const newUser = new User({
          _id: new mongoose.Types.ObjectId(oldUser._id.$oid), // Use the old ID if possible and unique
          email: email,
          username: oldUser.username,
          password: plainPassword, // Storing plain text password
          roles: userRoles,
          isActive: oldUser.isActive ?? true, // Default to true if missing
          version: oldUser.version ?? 1 // Default to 1 if missing
          // Add createdAt/updatedAt if you want to preserve them, otherwise Mongoose handles them
          // createdAt: oldUser.createdAt?.$date ? new Date(oldUser.createdAt.$date) : undefined,
          // updatedAt: oldUser.updatedAt?.$date ? new Date(oldUser.updatedAt.$date) : undefined,
        });

        const createdUser = await newUser.save();
        logger.info(
          ` -> User created successfully: ${createdUser._id} for ${email}`
        );

        // 4. Create the Profile linked to the User
        logger.debug(`Creating profile for user: ${createdUser._id}`);
        const { firstName, lastName } = splitFullName(oldUser.fullname);

        // *** Use the updated mapping function ***
        const profileType = mapRoleToProfileType(
          oldUser.role,
          oldUser.designation,
          oldUser.username // Pass username for specific checks
        );
        logger.debug(`Mapped profile type for ${email}: ${profileType}`);

        const newProfile = new Profile({
          type: profileType, // Use the calculated profile type
          userId: createdUser._id,
          firstName: firstName,
          lastName: lastName,
          primaryNumber:
            oldUser.phoneNumber && oldUser.phoneNumber !== "*"
              ? oldUser.phoneNumber.replace(/\s/g, "") // Clean up phone number spaces
              : "N/A", // Handle '*' or missing phone
          primaryEmail: email,
          occupation: oldUser.designation || profileType, // Use designation or profile type as occupation fallback
          version: oldUser.version ?? 1
          // Add other fields from oldUser if they map to ProfileSchema fields
          // e.g., presentAddress, pincode, etc. if they existed in old data
          // createdAt/updatedAt will be set by timestamps: true
        });

        const createdProfile = await newProfile.save();
        logger.info(
          ` -> Profile created successfully: ${createdProfile._id} (Type: ${profileType}) linked to User ${createdUser._id}`
        );

        // 5. Create the default "Self Assigned" Project linked to the Profile/User
        // (No changes needed here based on the request, but ensure 'owner' and 'assignee' use createdUser._id)
        logger.debug(
          `Creating self-assigned project for profile/user: ${createdUser._id}`
        );
        const projectData = {
          title: "Self Assigned",
          description: `Default project for self-assigned tasks`, // Slightly better description
          owner: createdUser._id, // Link to the NEW User ID
          assignee: [createdUser._id], // Link to the NEW User ID
          branch:
            oldUser.branch && Array.isArray(oldUser.branch)
              ? oldUser.branch
              : [],
          notes: [],
          task: [],
          targetDate: null,
          version: 1
        };

        const selfAssignedProject = new Project(projectData);
        const createdProject = await selfAssignedProject.save();
        logger.info(
          ` -> Self-assigned project created successfully: ${createdProject._id} for User ${createdUser._id}`
        );

        migratedCount++;
      } catch (innerError) {
        logger.error(`Error processing user ${email}: ${innerError.message}`, {
          stack: innerError.stack,
          oldUserData: oldUser // Log the data that caused the error
        });
        errorCount++;
      }
    } // End of loop

    logger.info("--- Migration Summary ---");
    logger.info(`Successfully migrated: ${migratedCount}`);
    logger.info(`Skipped (already exist): ${skippedCount}`);
    logger.info(`Errors: ${errorCount}`);
    logger.info("User migration process finished.");
  } catch (error) {
    logger.error(
      `Fatal error during migration setup or JSON parsing: ${error.message}`,
      { stack: error.stack }
    );
  }
};

export default migrateOldUsers; // Export if you are calling it from elsewhere
