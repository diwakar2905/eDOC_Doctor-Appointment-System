import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import doc1 from '../assets/doc1.png'
import doc2 from '../assets/doc2.png'
import doc3 from '../assets/doc3.png'
import doc4 from '../assets/doc4.png'
import doc5 from '../assets/doc5.png'
import doc6 from '../assets/doc6.png'
import doc7 from '../assets/doc7.png'
import doc8 from '../assets/doc8.png'
import doc9 from '../assets/doc9.png'
import doc10 from '../assets/doc10.png'
import doc11 from '../assets/doc11.png'
import doc12 from '../assets/doc12.png'
import doc13 from '../assets/doc13.png'
import doc14 from '../assets/doc14.png'
import doc15 from '../assets/doc15.png'

const MyAppointments = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [payment, setPayment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const DocImages  = {
    "doc1" : doc1,
    "doc2" : doc2,
    "doc3" : doc3,
    "doc4" : doc4,
    "doc5" : doc5,
    "doc6" : doc6,
    "doc7" : doc7,
    "doc8" : doc8,
    "doc9" : doc9,
    "doc10" : doc10,
    "doc11" : doc11,
    "doc12" : doc12,
    "doc13" : doc13,
    "doc14" : doc14,
    "doc15" : doc15,
}

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  // Getting User Appointments Data Using API
  const getUserAppointments = async () => {
    await fetch(backendUrl + "/users/appointments", {
        method: "GET",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (res) => {
        if (!res.ok) { 
          switch (res.status) {
          
            case 401:
                toast.error("Please Log in again");
                navigate("/login");
                break;
            case 500:
                toast.error("Internal Server Error, Try Again Later");
                break;
            case 404:
                    setAppointments(null);
                    break;
              default:
                toast.error("Unexpected Error Occurred");
                break;
            }
        }
        else return await res.json(); // Parse the response body as JSON
      })
      .then((res) => {
        if (res) {
            setAppointments(res.reverse());
        }
      })
      .catch((err) => {
        // Handle any errors that occurred during the fetch or response handling
        console.error("Error:", err);
        toast.error("Something went wrong. Please try again.");
      });
    
  };

  // Fetch user details and appointments
  // Your backend URL

  const fetchUserDetails = async () => {
    try {
        await fetch(backendUrl + "/users/userDetails", {
            method: "GET", // Use GET method
            headers: {
              "Content-Type": "application/json", // Ensure headers are set correctly
            },
            credentials: "include", // This allows sending cookies with the request
          })
            .then(async (res) => {
              if (!res.ok) { 
                switch (res.status) {
                
                    case 401:
                      toast.error("Please Log in again");
                      navigate("/login");
                      break;
                    case 500:
                      toast.error("Internal Server Error, Try Again Later");
                      break;
                    default:
                      toast.error("Unexpected Error Occurred");
                      break;
                  }
       
              }
              return await res.json(); // Parse the response body as JSON
            })
            .then((res) => {
                setEmail(res.email);
                      setName(res.name);
                      getUserAppointments();
            })
            .catch((err) => {
              // Handle any errors that occurred during the fetch or response handling
              console.error("Error:", err);
              toast.error("Something went wrong. Please try again.");
            });
          
      
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };


  // Function to cancel appointment Using API
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/user/cancel-appointment",
        { appointmentId }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Initialize Razorpay payment
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);
        try {
          const { data } = await axios.post(
            backendUrl + "/user/verifyRazorpay",
            response
          );
          if (data.success) {
            navigate("/my-appointments");
            getUserAppointments();
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Function to make payment using Razorpay
  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + "/user/payment-razorpay", {
        appointmentId,
      });
      if (data.success) {
        initPay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to make payment using Stripe
  const appointmentStripe = async (appointmentId) => {
    try {
      const { data } = await axios.post(backendUrl + "/user/payment-stripe", {
        appointmentId,
      });
      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUserDetails();
  }, []); // Empty dependency array ensures it runs once after the component mounts

  return (
    <div>
      <p className="pb-2 mt-12 text-xl font-medium">Welcome {name}</p>
      <p className="pb-3 mt-1 text-sm font-medium">Account Email : {email}</p>
      <p className="pb-3 mt-1 text-sm font-medium">View And Manage Your Appointments From Here</p>
      <p className="pb-3 mt-5 text-lg font-medium text-gray-600 border-b">
        My appointments
      </p>
      <div>
   
        { appointments ? appointments.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b"
          >
            <div>
              <img
                className="w-36 bg-[#EAEFFF]"
                src= { DocImages[item.doctor_image]}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-[#5E5E5E]">
              <p className="text-[#262626] text-base font-semibold">
                {item.doctor_name}
              </p>
              <p>{item.doctor_speciality}</p>
              <p className="text-[#464646] font-medium mt-1">Address:</p>
              <p>{item.address_line1}</p>
              <p>{item.address_line2}</p>
              <p className="mt-1">
                <span className="text-sm text-[#3C3C3C] font-medium">
                  Date & Time:
                </span>{" "}
                {}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-2 justify-end text-sm text-center">
              {!item.cancelled &&
                !item.payment &&
                !item.isCompleted &&
                payment !== item._id && (
                  <button
                    onClick={() => setPayment(item._id)}
                    className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Pay Online
                  </button>
                )}
              {!item.cancelled &&
                !item.payment &&
                !item.isCompleted &&
                payment === item._id && (
                  <button
                    onClick={() => appointmentStripe(item._id)}
                    className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    <img
                      className="max-w-20 max-h-5"
                      src={assets.stripe_logo}
                      alt=""
                    />
                  </button>
                )}
              {!item.cancelled &&
                !item.payment &&
                !item.isCompleted &&
                payment === item._id && (
                  <button
                    onClick={() => appointmentRazorpay(item._id)}
                    className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-gray-100 hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    <img
                      className="max-w-20 max-h-5"
                      src={assets.razorpay_logo}
                      alt=""
                    />
                  </button>
                )}
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded text-[#696969] bg-[#EAEFFF]">
                  Paid
                </button>
              )}
              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Completed
                </button>
              )}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-[#696969] sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Cancel appointment
                </button>
              )}
              {item.cancelled && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment cancelled
                </button>
              )}
            </div>
          </div>
        )) : <h1 className="mt-2">No Records As Of Now, Your Appointments Will Apper Here</h1>}
      </div>
    </div>
  );
};

export default MyAppointments;
