class NewNote extends React.Component {
  render() {
    return (
      <div className="new-note">
        <input type="text" placeholder="Note title" />
        <textarea placeholder="Note body"></textarea>
        <button className="clear">Clear notes</button>
        <button className="add">X</button>
        <div className="clearfix"></div>
      </div>
    )
  }
}

class NoteContainer extends React.Component {
  render() {
    return (
      <div className="note-container">
      </div>
    )
  }
}

class Popup extends React.Component {
  render() {
    return (
      <div>
        Some text
      </div>
    );
  }
}

ReactDOM.render(
  <Popup />,
  document.getElementById('outer-wrapper')
);