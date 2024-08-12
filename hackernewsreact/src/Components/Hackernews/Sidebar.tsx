import './Sidebar.css'
const Sidebar = () => {
    return (  
            
                <ul className="custom-list">
                    <div className="custom-list-div active" id="all">
                        <li className="news"><a href="#">All</a></li>
                    </div>
                    <div className="custom-list-div" id="hot">
                        <li className="hot"><a href="#">Hot</a></li>
                    </div>
                    <div className="custom-list-div" id="show-hn">
                        <li className="show-hn"><a href="#">Show HN</a></li>
                    </div>
                    <div className="custom-list-div" id="ask-hn">
                        <li className="ask-hn"><a href="#">Ask HN</a></li>
                    </div>
                    <div className="custom-list-div" id="poll">
                        <li className="polls"><a href="#">Polls</a></li>
                    </div>
                    <div className="custom-list-div" id="job">
                        <li className="jobs"><a href="#">Jobs</a></li>
                    </div>
                    <div className="custom-list-div" id="starred">
                        <li className="starred"><a href="#">Starred</a></li>
                    </div>
                </ul>
           
            
    );
};

export default Sidebar;
