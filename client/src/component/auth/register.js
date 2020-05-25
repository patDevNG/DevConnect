import React, { Fragment, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const Register = ()=>{
    const [formData, setFormData] = useState(
        {
            name:'',
            email:'',
            password:'',
            confirmpassword:''

        }
    );

    const{
        name,
        email,
        password,
        confirmpassword
    } = formData;
    const onChange = e => setFormData({...formData,[e.target.name]:e.target.value})
    const onSubmit = async e =>{
        e.preventDefault();
        if(password != confirmpassword){
            console.log("password does not match");
            
        }else{
            console.log(formData);
            const newUser ={
                name,
                email,
                password
            }
            const config = {
                header:{
                    'Content-Type':'apllication/json'
                }
            }
            // const body = JSON.stringify(newUser)
            try {
                const res =await axios.post('/api/v1/users',newUser,config);
                console.log(res.data);
                
            } catch (e) {
                console.error(e.response.data);
                
            }
        }
    }
    return(
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
      <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
      <form className="form" onSubmit ={e =>onSubmit(e)}>
        <div className="form-group">
          <input type="text" placeholder="Name" 
          name="name" value={name}
          onChange = {e => onChange(e)}
          required />
        </div>
        <div className="form-group">
          <input type="email" placeholder="Email Address"
           name="email"
           value={email}
          onChange = {e => onChange(e)}
           required />
          <small className="form-text"
            >This site uses Gravatar so if you want a profile image, use a
            Gravatar email</small
          >
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
             value={password}
          onChange = {e => onChange(e)}
            minLength="6"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="confirmpassword"
             value={confirmpassword}
          onChange = {e => onChange(e)}
            minLength="6"
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
        </Fragment>
        
    );
}

export default Register;