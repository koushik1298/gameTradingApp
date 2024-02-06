const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    category: {type: String, required: [true, 'category is required']},
    title: {type: String, required: [true, 'title is required']},
    details: {type: String, required: [true, 'details is required'], 
                minLength: [10, 'The details should have atleast 10 characters']},
    director: {type: String, required: [true, 'director name is required']},
    start_date: {type: String, required: [true, 'Start Date is required']},
    host_name: {type: String, required: [true, 'hostname is required']},
    host_id: {type: Schema.Types.ObjectId, ref: 'User'},
    image: {type: String, required: [true, 'Tournament Logo is required']},
    offerby: {type: Schema.Types.ObjectId, ref: 'Trade'},
    offerto: {type: Schema.Types.ObjectId, ref: 'Trade'},
    offered: {type: Boolean},
    initiated: {type: Boolean},
    status: {type: String}
},
{timestamps:true}
);

module.exports = mongoose.model('trades', tradeSchema);

  