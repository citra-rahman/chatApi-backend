/* eslint-disable lines-around-directive */
/* eslint-disable no-path-concat */
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line import/no-dynamic-require
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
console.log(config);
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
// Test connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Success!');
  })
  .catch((err) => {
    console.log(err);
  });

// database creation
sequelize.sync({ force: true }).then(() => {
  console.log('Database & tables created!');
});

fs.readdirSync(__dirname)
  .filter(
    (file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.messages = require('./message')(sequelize, Sequelize);
db.users = require('./user')(sequelize, Sequelize);

/**
 * set many to one relation
 * @param source the many entity table
 * @param target the one entity table
 * @param options the options
 */
const belongsTo = (source, target, options) => {
  source.belongsTo(target, options);
};

belongsTo(db.messages, db.users, { onDelete: 'CASCADE', foreignKey: 'toId', targetKey: 'id' });
belongsTo(db.messages, db.users, { onDelete: 'CASCADE', foreignKey: 'fromId', targetKey: 'id' });

db.sequelize.sync({ force: true }).then(() => {
  console.log('Drop and re-sync db.');
});
module.exports = db;