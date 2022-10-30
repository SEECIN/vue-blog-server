module.exports = {
  "Article": {
    "queryAct": "findByIdAndUpdate",
    "options": function () {
      return {
        "$inc": {
          "hit_num": 1
        }
      }
    }
  }
}