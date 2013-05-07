module.exports = function(Schema) {
  return new Schema({
    account : {type: String, index: true, unique: true},
    roles: [String]
  });
};