import mongoose from 'mongoose'

const msgappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestampe: String,
    received: Boolean,
})

export default mongoose.model('messagecontents', msgappSchema)
