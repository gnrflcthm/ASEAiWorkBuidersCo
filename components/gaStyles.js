import styled from "styled-components";

export const ChartWrapper = styled.div`
  width: 80vw;
  margin: 0 auto;
`;

export const PieChartWrapper = styled.div`
  width: 48vw;
  margin: 0 auto;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const colors = [
  "#fcba03",
  "#fa8c5c",
  "#9fc934",
  "#60d17e",
  "#45afed",
  "#7c5cdb",
  "#ce5cdb",
  "#db5c97",
];

/*
export const colors = [
  "#031579",
  "#031579",
  "#031579",
  "#031579",
  "#031579",
  "#031579",
  "#031579",
  "#031579",
];
*/

export const ChartTitle = styled.h2`
  color: white;
  font-size: 2rem;
`;

export const Subtitle = styled.h3`
  color: white;
  padding-bottom: 20px;
`;

export const ReportWrapper = styled.div`
  padding: 40px 0;
  border-bottom: 1px solid #f0eee9;
`;

export const LastRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
  flex-direction: row;
`;

export const DatepickerRow = styled.div`
  width: 60vw;
  display: flex;
  justify-content: space-evenly;
  margin: 0 auto;
`;

export const DatepickerWrapper = styled.div`
  color: black;
  font-weight: 500;
  margin-top: 20px;
  .picker {
    width: fit-content;
    border-color: #a2c1f2;
    border-radius: 10px;
    background-color: #0275D8;
    color: white;
    text-align: center;
    line-height: 20px;
    font-size: 1rem;
    margin-bottom: 25px;
    cursor: pointer;
  }
  .picker:hover {
      color: black;
  }
`;

export const DatepickerLabel = styled.label`
  padding-right: 5px;
`;

export const ButtonContainer = styled.div`
  height: 70vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ChartContainer = styled.div`
  background: white;
  border-radius: 10px;
  opacity: 0.97;
  box-shadow: 2px 2px;
  border: 2px solid black;
  outline: 2px solid white;
`;