import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import axios from "axios";
import { toast } from "react-toastify";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, getDoctosData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [docInfo, setDocInfo] = useState(false);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const navigate = useNavigate();

  const fetchDocInfo = async () => {
    const docInfo = await doctors.find(
      (doc) => doc.id == docId.replace("doc", "")
    );

    setDocInfo(docInfo);
  };

  const allSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];
  const getAvailableSolts = async () => {
    var id = docId.replace("doc", "");
    axios
      .post(
        backendUrl + "/appointments/getDocBookedSlots",
        { docId: id },
        { withCredentials: true }
      )
      .then((data) => {
        setDocSlots(data.data.map((slot) => slot.slotnum));
      });

    // getting current date
    let today = new Date();
  };

  const bookAppointment = async () => {
    var slotNum = document.getElementById("time-slot").value;
    var id = docId.replace("doc", "");
    
    try {
      const response = await axios.post(
        backendUrl + "/appointments/book-appointment",
        {
          docID: id,
          slotNum: slotNum,
        },
        { withCredentials: true }
      );
      console.log("API Response:", response); // Log the response
      if (response.status == 200) {
        toast.success("Appointment Booked");
        navigate("/my-appointments");
      } else {
        toast.error(response.data?.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error:", error); // Log the error
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error("Please Login First");
            break;
          case 500:
            toast.error("Server Error, Try Again Later");
            break;
          default:
            toast.error(
              error.response.data?.message || "An unknown error occurred."
            );
            break;
        }
      } else {
        toast.error("Unable to connect to the server. Please try again later.");
      }
    }
    
      
  };

  useEffect(() => {
    fetchDocInfo();
  }, [docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSolts();
    }
  }, [docInfo]);

  return docInfo ? (
    <div>
      {/* ---------- Doctor Details ----------- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-primary w-full sm:max-w-72 rounded-lg"
            src={docInfo.image}
            alt=""
          />
        </div>

        <div className="flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          {/* ----- Doc Info : name, degree, experience ----- */}

          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {docInfo.name}{" "}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>

          {/* ----- Doc About ----- */}
          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-[#262626] mt-3">
              About <img className="w-3" src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-600 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>

          <p className="text-gray-600 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-800">
              {currencySymbol}
              {docInfo.fees}
            </span>{" "}
          </p>
        </div>
      </div>

      {/* Booking slots */}
      <div className="sm:ml-72 sm:pl-4 mt-8 font-medium text-[#565656]">
        <p className="text-xl">Booking slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4 text-lg">
          <label for="time-slot">Select a Time Slot:</label>
          <select id="time-slot" name="time-slot">
            {allSlots.map((slot, index) => {
                console.log(docSlots)
              if (docSlots.includes(index)) {
                return (
                  <>
                    <option
                      value={index}
                      disabled
                      className="disabled:bg-gray-400"
                    >
                      {slot}
                    </option>
                  </>
                );
              } else {
                return <option value={index} selected>{slot}</option>;
              }
            })}
          </select>
          {}
        </div>

        <button
          onClick={bookAppointment}
          className="bg-primary text-white text-sm font-light px-20 py-3 rounded-full my-6"
        >
          Book an appointment
        </button>
      </div>

      {/* Listing Releated Doctors */}
      <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
    </div>
  ) : (
    <>
      <h1 className="text-2xl font-semibold">No Such Doctor Found</h1>
      <button
        onClick={() => {
          navigate(`/doctors`);
          scrollTo(0, 0);
        }}
        className="bg-green-300 text-grey-600 px-12 py-3 rounded-full mt-10"
      >
        All Doctors
      </button>
    </>
  );
};

export default Appointment;
