const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建读取用户输入的接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 数据库连接配置
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // 将通过用户输入获取
};

// 读取SQL文件内容
const sqlFilePath = path.join(__dirname, 'init-db.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// 询问用户MySQL root密码
rl.question('请输入MySQL root用户的密码: ', (password) => {
  config.password = password;
  
  // 创建数据库连接，启用multipleStatements支持
  const connection = mysql.createConnection({ ...config, multipleStatements: true });

  // 执行SQL脚本
  connection.connect((err) => {
    if (err) {
      console.error('连接数据库失败:', err);
      rl.close();
      return;
    }
    console.log('成功连接到MySQL数据库');

    // 执行SQL语句
    connection.query(sqlContent, (err, results) => {
      if (err) {
        console.error('执行SQL脚本失败:', err);
        return;
      }
      console.log('数据库初始化成功！');
      console.log('创建的表:', results[0]?.message || 'users');
    });

    // 关闭连接
    connection.end((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err);
      } else {
        console.log('数据库连接已关闭');
      }
      rl.close();
    });
  });
});
