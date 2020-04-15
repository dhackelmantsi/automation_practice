const Event = require('../../models/event')
const User  = require('../../models/users');
const { transformEvent } = require('../../helpers/resolver_helpers')


module.exports = {
    events: async () => {
        try{
            const events = await Event.find()
            return events.map(event => {
            return transformEvent(event);
            })
        } catch (err) {
            throw err;
        }
    }, 
    createEvent: async (args, req) => {
        // Authentticating the request
        if(!req.isAuth) {
            throw new Error('Unauthenticated access');
        }


        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userid  
        });  
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);
            const creator = await User.findById("5e965d0dd101182163b8819d");
            if (!creator) {
                throw new Error('No such User exists');
            }
            creator.createdEvents.push(event);
            return createdEvent;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
}