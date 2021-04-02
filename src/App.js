import React from "react";
import axios from "axios";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: null,
      search: "",
      select: "movie",
      page: 1,
      pages: 0,
      detail: "",
    };
  }

  handleInput = (e) => {
    this.setState({ search: e.target.value });
  };

  handleButton = () => {
    axios
      .get(
        `http://www.omdbapi.com/?apikey=fd56c23c&s=${this.state.search}&type=${this.state.select}`
      )
      .then((res) => {
        console.log(res.data);
        res.data.Response === "True"
          ? this.setState({
              content: { ...res.data.Search },
              page: 1,
              pages: Math.ceil(res.data.totalResults / res.data.Search.length),
              detail: "",
            })
          : this.setState({ content: null, detail: "" });
      });
  };

  handleSelect = (e) => {
    this.setState({ select: e.target.value });
  };

  handlePage = (nextOrPrev) => {
    axios
      .get(
        `http://www.omdbapi.com/?apikey=fd56c23c&s=${this.state.search}&type=${
          this.state.select
        }&page=${this.state.page + nextOrPrev}`
      )
      .then((res) => {
        console.log(res.data);
        res.data.Response === "True"
          ? this.setState((prevState) => ({
              content: { ...res.data.Search },
              page: prevState.page + nextOrPrev,
              detail: "",
            }))
          : this.setState({ content: null, detail: "" });
      });
  };

  handlePagination = (pageNumber) => {
    axios
      .get(
        `http://www.omdbapi.com/?apikey=fd56c23c&s=${this.state.search}&type=${this.state.select}&page=${pageNumber}`
      )
      .then((res) => {
        this.setState({
          content: { ...res.data.Search },
          page: pageNumber,
          detail: "",
        });
      });
  };

  handleDetail = (imdbID) => {
    axios
      .get(`http://www.omdbapi.com/?apikey=fd56c23c&i=${imdbID}`)
      .then((res) => {
        this.setState({ detail: { ...res.data } });
      });
  };

  render() {
    return (
      <div>
        <Input search={this.state.search} onChange={this.handleInput} />
        <select onChange={this.handleSelect}>
          <option value="movie">Movie</option>
          <option value="series">Series</option>
          <option value="episode">Episode</option>
        </select>
        <Button onClick={this.handleButton} value="Search" />
        <div className="films">
          <Film content={this.state.content} onClick={this.handleDetail} />
        </div>
        {this.state.content && this.state.page > 1 ? (
          <Button value="Prev" onClick={() => this.handlePage(-1)} />
        ) : !this.state.content && this.state.page <= 1 ? null : (
          <Button
            value="Prev"
            disabled={true}
            onClick={() => this.handlePage(-1)}
          />
        )}
        {this.state.content ? (
          <Pagination
            pages={this.state.pages}
            page={this.state.page}
            onClick={this.handlePagination}
          />
        ) : null}
        {this.state.content && this.state.page < this.state.pages ? (
          <Button value="Next" onClick={() => this.handlePage(1)} />
        ) : !this.state.content ? null : (
          <Button value="Next" disabled onClick={() => this.handlePage(1)} />
        )}
        {this.state.detail ? <Details detail={this.state.detail} /> : null}
      </div>
    );
  }
}

function Input(props) {
  return <input value={props.search} onChange={props.onChange} />;
}

function Button(props) {
  return (
    <input
      type={"button"}
      value={props.value}
      onClick={props.onClick}
      disabled={props.disabled}
    />
  );
}

function Pagination(props) {
  let butArr = [
    props.page - 2,
    props.page - 1,
    props.page,
    props.page + 1,
    props.page + 2,
  ];

  return butArr.reduce((accum, item, index) => {
    return item >= 1 && item <= props.pages
      ? item === props.page
        ? (accum = [
            ...accum,
            <Button
              key={index}
              value={item}
              disabled
              onClick={() => props.onClick(item)}
            />,
          ])
        : (accum = [
            ...accum,
            <Button
              key={index}
              value={item}
              onClick={() => props.onClick(item)}
            />,
          ])
      : (accum = [...accum]);
  }, []);
}

function Film(props) {
  return props.content
    ? Object.entries(props.content).map(([key, value]) => (
        <div className="film" key={key}>
          <img className="film-img" src={value.Poster} alt="can`t load img" />
          <div className="film-text">
            <span>Type: {value.Type}</span>
            <span>Title: {value.Title}</span>
            <span>Year: {value.Year}</span>
            <Button
              value="Details"
              onClick={() => props.onClick(value.imdbID)}
            />
          </div>
        </div>
      ))
    : "Use search to find films";
}

function Details(props) {
  return (
    <div className="details">
      <img src={props.detail.Poster} alt="no img" />
      <div className="details-text">
        {Object.entries(props.detail || {}).reduce(
          (accum, [key, value], index) => {
            return key !== "Poster" && key !== "Ratings" && key !== "Response"
              ? (accum = [
                  ...accum,
                  <div key={index}>{`${key}: ${value}`}</div>,
                ])
              : (accum = [...accum]);
          },
          []
        )}
      </div>
    </div>
  );
}

export default App;
