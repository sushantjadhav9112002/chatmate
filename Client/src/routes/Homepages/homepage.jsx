import { Link } from 'react-router-dom';
import './homepage.css';
import { TypeAnimation } from 'react-type-animation';
import { useState } from 'react';

const Homepage = () => {

    const [typingStatus, settypingStatus]= useState("human1");

    
    return (
        <div className='homepage'>
            <img src='orbital.png' alt='Orbital Background' className='orbital'></img>
            <div className="left">
                <h1>Sushant's AI</h1>
                <h2>Supercharge your creativity and productivity.</h2>
                <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet.</h3>
                <Link to="/dashboard">Get Started</Link>
                
            </div>
            <div className="right">
                <div className="imgContainer">
                    <div className="bgContainer">
                        <div className="bg"></div>
                    </div>
                    <img src="/bot.png" className='bot' alt="" />
                    {/* <div className="chat">
                        <img src={typingStatus==="human1"? "/human1.jpeg" : typingStatus==="human2" ? "/human2.jpeg" : "/bot.png"} alt="" />
                        <TypeAnimation
                            sequence={[
                                // Same substring at the start will only be typed out once, initially
                                'Human: We produce food for Mice',
                                2000, ()=>{
                                    settypingStatus("bot");
                                },
                                'Bot: We produce food for Hamsters',
                                2000,()=>{
                                    settypingStatus("human2");
                                },
                                'Human2: We produce food for Guinea Pigs',
                                2000,()=>{
                                    settypingStatus("bot");
                                },
                                'Bot: We produce food for Chinchillas',
                                2000,()=>{
                                    settypingStatus("human1");
                                }
                            ]}
                            wrapper="span"
                            repeat={Infinity}
                            cursor={true}
                            omitDeletionAnimation={true}
                        
                        />
                    </div> */}
                </div>
            </div>
            <div className="terms">
                <img src="logo.png" alt="" />
                <div className="links">
                    <Link to="/">Terms of Service</Link>
                    <span>|</span>
                    <Link to="/">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}

export default Homepage;
