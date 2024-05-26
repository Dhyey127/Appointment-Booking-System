import React, { useEffect, useState } from "react";
import GeoLocationComponent from "../../component/Geolocation";
import instance from "../../api/api";
import { Button, Card, Col, Row, Select, Space, Tag, message } from "antd";
import Meta from "antd/es/card/Meta";
import CommonModal from "../../component/CommonModal";
import { removeDuplicates } from "../../utils/helper";

export default function Salon() {
  let [cords, setCords] = useState(null);
  const [salons, setSalons] = useState([]);
  const [book, setBook] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [salonDetails, setSalonDetails] = useState(null);
  const [services, setServices] = useState(null);
  const [barbers, setBarbers] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [slots, setSlots] = useState([]);
  const [id, setId] = useState(null);

  const getCords = (cords) => {
    setCords(cords);
  };

  const fetchSalons = async (cords) => {
    let data = await instance.post("/salon/get-nearby-salons", {
      lat: cords.latitude,
      long: cords.longitude,
    });

    setSalons(data.result);
  };

  const fetchServicesAndBarbers = async (salonId) => {
    let data = await instance.get(`/salon/services/${salonId}`);
    setSalonDetails(data.result);
  };

  const addSlots = async (barber_id) => {
    let data = await instance.post("/slot/create", {
      salon_id: selectedSalon._id,
      barber_id,
    });
    setId(data.result._id);
    setSlots(
      data.result.slots.map((slot) => {
        return {
          ...slot,
          isClicked: false,
        };
      })
    );
  };

  useEffect(() => {
    if (cords) fetchSalons(cords);
  }, [cords]);

  useEffect(() => {
    if (selectedSalon) fetchServicesAndBarbers(selectedSalon._id);
  }, [selectedSalon]);

  useEffect(() => {
    if (salonDetails) {
      let salonServices = removeDuplicates(
        salonDetails?.map((service) => service.service).flat(1) || [],
        "name"
      );
      setServices(
        salonServices.map((service) => {
          return {
            ...service,
            isClicked: false,
          };
        })
      );
    }
  }, [salonDetails]);

  let content = (salon) => {
    return (
      <div>
        <div>
          <h3>Name</h3> {salon?.name}
        </div>
        <h3>Select Services</h3>
        <Space wrap>
          {services?.map((service, i) => (
            <Card
              size="small"
              title={null}
              key={service._id}
              style={
                service.isClicked
                  ? {
                      width: 150,
                      height: 50,
                      cursor: "pointer",
                      border: "1px solid #1677ff",
                      background: "#1677ff",
                      color: "white",
                    }
                  : {
                      width: 150,
                      height: 50,
                      cursor: "pointer",
                    }
              }
              onClick={() => {
                let service = services;
                let updated = service.map((s, index) => {
                  if (i === index) {
                    return { ...s, isClicked: true };
                  } else {
                    return { ...s, isClicked: false };
                  }
                });
                setServices([...updated]);

                // Set barbers with selected services
                let barber = salonDetails.filter((detail) =>
                  detail.service.some(
                    (service) => service.name === services[i].name
                  )
                );
                setBarbers(barber);
              }}
            >
              {service.name}
            </Card>
          ))}
        </Space>
        {barbers && (
          <div>
            <h3>Select Barbers</h3>
            <Select
              showSearch
              placeholder="Select barber"
              onChange={async (value) => {
                setSelectedBarber(value);
                await addSlots(value);
              }}
              value={selectedBarber}
              size="large"
              options={barbers.map((barber) => {
                return {
                  label: barber.name,
                  value: barber._id,
                  key: barber._id,
                };
              })}
            />
          </div>
        )}
        {slots?.length > 0 && (
          <div>
            <h3>Select Slot</h3>
            {slots.map((slot, i) => {
              return (
                <Tag
                  key={slot._id}
                  onClick={() => {
                    if (!slot.is_booked) {
                      let slot = slots;
                      let updated = slot.map((s, index) => {
                        if (i === index) {
                          return { ...s, isClicked: true };
                        } else {
                          return { ...s, isClicked: false };
                        }
                      });

                      setSlots([...updated]);
                    }
                  }}
                  style={
                    slot.is_booked
                      ? {
                          padding: "5px",
                          margin: "5px",
                          opacity: 0.5,
                        }
                      : slot.isClicked
                      ? {
                          padding: "5px",
                          margin: "5px",
                          cursor: "pointer",
                          background: "#1677ff",
                          color: "white",
                        }
                      : { padding: "5px", margin: "5px", cursor: "pointer" }
                  }
                  d
                >
                  {slot.slot_start_time} - {slot.slot_end_time}
                </Tag>
              );
            })}
            <Button
              type="primary"
              style={{ marginTop: "20px" }}
              onClick={() => {
                let is_updated = slots.filter((slot) => slot.isClicked);

                if (is_updated.length === 0) {
                  message.error("please select slot");
                } else {
                  let updated_slots = slots.map((slot) => {
                    if (slot.isClicked) {
                      return { ...slot, is_booked: true };
                    } else {
                      return { ...slot };
                    }
                  });
                  instance.put("/slot/book-slot", { id, slots: updated_slots });

                  //cleanup
                  setSelectedBarber(null);
                  setSelectedSalon(null);
                  setServices(null);
                  setBarbers(null);
                  setSlots(null);
                  setBook(false);
                }
              }}
            >
              Book Appointment
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <GeoLocationComponent getCords={getCords} />
      <h2>Salons near me</h2>
      <Row gutter={[48, 16]}>
        {salons.length > 0 ? (
          salons.map((salon) => (
            <Col span={4} key={salon._id}>
              <Card
                hoverable
                cover={<img alt="example" src={salon.image} height={200} />}
                onClick={() => {
                  setSelectedSalon(salon);
                  setBook(true);
                }}
              >
                <Meta title={salon.name} />
              </Card>
            </Col>
          ))
        ) : (
          <div>No salons near you</div>
        )}
      </Row>
      <CommonModal
        title={"Book Appointment"}
        isModalOpen={book}
        handleCancel={() => setBook(false)}
        content={content(selectedSalon)}
      />
    </div>
  );
}
