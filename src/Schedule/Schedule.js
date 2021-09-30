import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';

import './Schedule.scss';
import schedulingData from './bus-scheduling-input.json'

function createBus(trips = []) {
  return {
    trips,
  };
}

function shakeBuses(trips) {
  const sortedTrips = trips.sort((a, b) => a.startTime - b.startTime);
  const buses = [createBus()];

  for (let i in sortedTrips) {
    const curr = sortedTrips[i];
    const prev = sortedTrips[i - 1] || { endTime: 0 };

    if (curr.startTime < prev.endTime) {
      buses.push(createBus());
    }
    const bus = buses[buses.length - 1];

    bus.trips.push(curr);
  };

  return buses.sort((a, b) => a.id - b.id);
}

function makeBuses(trips) {
  return trips.map(trip => createBus([trip]));
}


function Schedule() {
  const [trips, setTrips] = useState(schedulingData);
  const [activeTripId, setActiveTripId] = useState(null);
  const [busToTrips, setBusToTrips] = useState(makeBuses(trips));
  const [canGo, setCanGo] = useState(false);

  const getHandleClickTrip = id => () => {
    setActiveTripId(prevId => prevId !== id ? id : null);
  };

  const getHandleClickBus = busIndex => evt => {
    if (!canGo || activeTripId === null || evt.target.classList.contains('Schedule__trip')) {
      return;
    }

    const newBusToTrips = [];
    const trip = trips.find(item => item.id === activeTripId);

    for (let index in busToTrips) {
      const bus = busToTrips[index];
      const newTrips = bus.trips.filter(item => item.id !== activeTripId);

      newBusToTrips.push({ trips: newTrips });
    }
    
    newBusToTrips[busIndex].trips.push(trip);

    setBusToTrips(newBusToTrips.filter(item => !!item.trips.length));
    setActiveTripId(null);
  }

  const getHandleMouseOverBus = busIndex => evt => {
    if (activeTripId === null) return false;
    const trip = trips.find(item => item.id === activeTripId);

    const cannot = busToTrips[busIndex].trips.some(item => {
      return (item.startTime < trip.endTime && item.endTime > trip.startTime) || (item.endTime > trip.startTime && item.startTime < trip.endTime)
    })

    setCanGo(!cannot);
  }

  useEffect(() => {
    const newBusToTrips = [...busToTrips];

    if (activeTripId !== null) {
      newBusToTrips.push(createBus());
      setBusToTrips(newBusToTrips)
    } else if (!newBusToTrips[newBusToTrips.length - 1].trips.length) {
      newBusToTrips.pop();
      setBusToTrips(newBusToTrips)
    }
  }, [activeTripId === null])

  return (
    <div className="Schedule">
      <div className="Schedule__container">
        <div className="Schedule__left">
          {busToTrips.map((item, index) => {
            const theLastOne = activeTripId !== null && (busToTrips.length - 1 === index);
            const time = theLastOne ? null : '';

            return (
              <div className="Schedule__time-bus">
                {theLastOne ? <b>New Bus</b> : <b>Bus {index}</b>}
                {time && <time datetime={time}>{time}</time>}
              </div>
            )
          })}
        </div>
        <div className="Schedule__right">
          <div className="Schedule__header">
            {(new Array(10).fill('')).map((_, item) => (
              <div className="Schedule__time">{item}:00</div>
            ))}
          </div>
          {busToTrips.map((bus, index) => (
            <div
              className="Schedule__bus"
              key={index}
              onClick={getHandleClickBus(index)}
              onMouseOver={getHandleMouseOverBus(index)}
              style={{ cursor: activeTripId === null ? 'default' : canGo ? 'pointer' : 'not-allowed'}}
            >
              {bus.trips.map((trip) => (
                <div
                  className={cx("Schedule__trip", { active: activeTripId === trip.id })}
                  key={trip.id}
                  style={{ width: trip.endTime - trip.startTime + 'px', left: trip.startTime + 'px' }}
                  onClick={getHandleClickTrip(trip.id)}
                >
                  {trip.id}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Schedule;
