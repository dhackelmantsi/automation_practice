import React, { Component } from 'react';

import Modal from '../../components/Modal/Modal';
import Backdrop from '../../components/Backdrop/Backdrop';
import EventList from '../../components/Events/EventList/EventList';
import Spinner from '../../components/Spinner/Spinner';

import AuthContext from '../../context/auth-context';


import './Events.css';

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false
  }

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef  = React.createRef();
    this.descriptionElRef = React.createRef();
    
  }

  componentDidMount() {
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({creating: true})
  };

  modalConfirmHandler = () => {
    this.setState({creating: false});
    const title = this.titleElRef.current.value;
    const price = +this.priceElRef.current.value;
    const date  = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    // Validating the data
    if(
      title.trim().length === 0 ||
      price < 0 ||
      date.trim().length  === 0 ||
      description.trim().length === 0 ) {
        return;

    }

    const event = {title, price, date, description};
    console.log(event);

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price} , date: "${date}"}) {
            _id
            title
            description
            date
            price
          }
        }
      `
      };

    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
    .then(res => {
      if(res.status !==200 && res.status !== 201) {  
        throw new Error('Failed');      
      }
      return res.json();
    })
    .then(resData => {
      this.setState(prevState => {
        const updatedEvents = [...prevState.events];
        updatedEvents.push({
          _id: resData.data.createEvent._id,
          title: resData.data.createEvent.title,
          description: resData.data.createEvent.description,
          date: resData.data.createEvent.date,
          price: resData.data.createEvent.price,
          creator: {
            _id: this.context.userId
          }  
        });
        return {events: updatedEvents};
      });
    }) 
    .catch(err => {
      console.log(err);
    });
    
  };

  modalCancelHandler = () => {
    this.setState({creating: false});
  };

  fetchEvents() {
    this.setState({isLoading: true});
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
              }
            }
          }
        `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }
      return res.json();
    })
    .then(resData => {
      const events = resData.data.events;
      this.setState({events: events, isLoading: false});
    })
    .catch(err => {
      console.log(err);
      this.setState({isLoading: false});
    });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.creating && <Backdrop />}
        {this.state.creating &&
          <Modal 
            title ="Add Event" 
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler} 
            onConfirm={this.modalConfirmHandler}
          >
           <form>
             <div className="form-control">
               <label htmlFor="title">Title</label>
               <input type="text" id="title" ref={this.titleElRef}></input>
             </div>

             <div className="form-control">
               <label htmlFor="price">Price</label>
               <input type="number" id="price" ref={this.priceElRef}></input>
             </div>

             <div className="form-control">
               <label htmlFor="date">Date</label>
               <input type="datetime-local" id="date" ref={this.dateElRef}></input>
             </div>

             <div className="form-control">
               <label htmlFor="description">Description</label>
               <textarea id="description" rows="4" ref={this.descriptionElRef}></textarea>
             </div>
           </form>
          </Modal>
        }
       
        {this.context.token && (
          <div className="events-control">
            <p>
              CREATE YOUR OWN EVENTS !!!  
            </p>
            <button className="btn" onClick={this.startCreateEventHandler}> Create Event</button>
          </div>
        )} 

        {this.state.isLoading 
          ? (<Spinner />)
          : (<EventList 
                events={this.state.events} 
                authUserId={this.context.userId}
            />)
        } 

        
      </React.Fragment>
    );
  }
}

export default EventsPage;