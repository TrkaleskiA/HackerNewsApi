import './Topbar.css'

type TimePeriod = 'last-24h' | 'past-week' | 'past-month' | 'forever';

type TopbarProps = {
    onTimePeriodChange: (period: TimePeriod) => void;
};

const Topbar = ({ onTimePeriodChange }: TopbarProps) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onTimePeriodChange(event.target.value as TimePeriod);
    };

    return (
        <div className="d-flex align-items-center mb-3 bg-white mt-1 p-3 results">
          <h4>All</h4>
          <div className="d-flex">
                <p style={{ marginLeft: '15px', marginTop: '22px', color: 'gray' }} ></p>
                <img className="share1" src="photos/share.png" alt="Share Icon"/>
          </div>
            <div className="form-check me-3" style={{ marginLeft: 'auto' }} >
                <input className="form-check-input" type="radio" name="time-period" id="last-24h" value="last-24h" onChange={handleChange} />
                  <label className="form-check-label" htmlFor="last-24h">Last 24h</label>
          </div>
            <div className="form-check me-3" style={{ marginRight: '30px' }} >
                <input className="form-check-input" type="radio" name="time-period" id="past-week" value="past-week" onChange={handleChange} />
                  <label className="form-check-label" htmlFor="past-week">Past week</label>
          </div>
          <div className="form-check me-3" style={{marginRight: '30px'}}>
                <input className="form-check-input" type="radio" name="time-period" id="past-month" value="past-month" onChange={handleChange} />
                  <label className="form-check-label" htmlFor="past-month">Past month</label>
          </div>
            <div className="form-check me-3" style={{ marginRight: '30px' }} >
                <input className="form-check-input" type="radio" name="time-period" id="forever" value="forever" defaultChecked onChange={handleChange} />
                  <label className="form-check-label" htmlFor="forever">Forever</label>
          </div>
      </div>
  );
}

export default Topbar;