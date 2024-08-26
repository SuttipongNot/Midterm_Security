const express = require('express')
const mysql = require('mysql2')
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const app = express()
const port = 3000

dotenv.config() 

const db = mysql.createConnection({
  host: process.env.Host,
  user: process.env.User,
  password: process.env.Password,
  database: process.env.Database
})

db.connect()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// เพิ่มสินค้า
app.post('/product', function(req, res) {
  const { productName, productDetail, price, cost, quantity } = req.body
  let sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)"
  db.query(sql, [productName, productDetail, price, cost, quantity], function(err, result) {
    if (err) {
      console.error(err) // log errors for debugging
      res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในบันทึกข้อมูลสินค้า', 'status': false })
      return
    }
    res.send({ 'message': 'บันทึกข้อมูลสินค้าสำเร็จ', 'status': true })
  })
})

// ดึงข้อมูลสินค้า
app.get('/product/:id', function(req, res) {
  const productID = req.params.id
  let sql = "SELECT * FROM product WHERE productID = ?"
  db.query(sql, [productID], function(err, result) {
    if (err) {
      console.error(err) 
      res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในดึงข้อมูลสินค้า', 'status': false })
      return
    }
    res.send(result)
  })
})

// การเข้าสู่ระบบ 
app.post('/login', function(req, res) {
    const { username, password } = req.body
    let sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1"
    db.query(sql, [username], function(err, result) {
      if (err) {
        console.error(err)
        res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false })
        return
      }
      if (result.length > 0) {
        let customer = result[0]
        bcrypt.compare(password, customer.password, function(err, isMatch) {
          if (err) {
            console.error(err)
            res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน', 'status': false })
            return
          }
          if (isMatch) {
            customer['message'] = "เข้าสู่ระบบสำเร็จ"
            customer['status'] = true
            res.send(customer)
          } else {
            res.send({ 'message': 'กรุณาระบุรหัสผ่านใหม่อีกครั้ง', 'status': false })
          }
        })
      } else {
        res.send({ 'message': 'ชื่อผู้ใช้ไม่ถูกต้อง', 'status': false })
      }
    })
  })

app.listen(port, function() {
  console.log(`server listening on port ${port}`)
})
