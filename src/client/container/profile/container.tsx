import React from 'react';

import styles from './profile.scss';

import html from '../../assets/html/embed.html';
import img from '../../assets/images/pig.jpg';

export class Profile extends React.Component<any, any> {
  componentWillMount() {
    console.log(img);
  }
  render() {
    const arr = [2].includes(2);
    const aa = [2].find(v => v === 2);
    return (
      <div className={styles.profile}>
        <div>This is my profile!</div>
        <img src={img} />
        <div>{html}</div>
      </div>
    );
  }
}

export default Profile;
