'use strict';
const jsk = require('../../dist/jskit-learn.cjs');
const expect = require('chai').expect;
const csvData = [
  {
    'Country': 'Brazil',
    'Age': '44',
    'Salary': '72000',
    'Purchased': 'No',
  },
  {
    'Country': 'Mexico',
    'Age': '27',
    'Salary': '48000',
    'Purchased': 'Yes',
  },
  {
    'Country': 'Ghana',
    'Age': '30',
    'Salary': '54000',
    'Purchased': 'No',
  },
  {
    'Country': 'Mexico',
    'Age': '38',
    'Salary': '61000',
    'Purchased': 'No',
  },
  {
    'Country': 'Ghana',
    'Age': '40',
    'Salary': '',
    'Purchased': 'Yes',
  },
  {
    'Country': 'Brazil',
    'Age': '35',
    'Salary': '58000',
    'Purchased': 'Yes',
  },
  {
    'Country': 'Mexico',
    'Age': '',
    'Salary': '52000',
    'Purchased': 'No',
  },
  {
    'Country': 'Brazil',
    'Age': '48',
    'Salary': '79000',
    'Purchased': 'Yes',
  },
  {
    'Country': 'Ghana',
    'Age': '50',
    'Salary': '83000',
    'Purchased': 'No',
  },
  {
    'Country': 'Brazil',
    'Age': '37',
    'Salary': '67000',
    'Purchased': 'Yes',
  },
];


describe('preprocessing', function () { 
  describe('RawData class', () => {
    const CSVRawData = new jsk.preprocessing.RawData(csvData);
    describe('constructor', () => {
      it('should instantiate a new RawData Class', () => {
        expect(CSVRawData).to.be.instanceof(jsk.preprocessing.RawData);
      });
    });
    describe('columnArray', () => {
      const countryColumn = CSVRawData.columnArray('Country');
      it('should select a column from CSV Data by name', () => {
        expect(countryColumn.length).to.equal(10);
        expect(countryColumn[ 0 ]).to.equal(csvData[ 0 ].Country);
      });
      it('should prefilter the dataset', () => {
        const countryColumnPreFiltered = CSVRawData.columnArray('Country', {
          prefilter: row => row.Country === 'Ghana',
        });
        expect(countryColumnPreFiltered.length).to.equal(3);
      });
      it('should filter the dataset', () => {
        const countryColumnPostFiltered = CSVRawData.columnArray('Country', {
          filter: val=> val === 'Brazil',
        });
        expect(countryColumnPostFiltered.length).to.equal(4);
      });
      it('should replace values in dataset', () => {
        const countryColumnReplaced = CSVRawData.columnArray('Country', {
          replace: {
            test: val => val === 'Brazil',
            value: 'China',
          },
        });
        const ageColumnReplacedFuncVal = CSVRawData.columnArray('Age', {
          replace: {
            test: val => val,
            value: (result, val, index, arr, name) => parseInt(val[ name ]) * 10,
          },
        });
        expect(ageColumnReplacedFuncVal[0]).to.equal(440);
        expect(countryColumnReplaced[0]).to.equal('China');
      });
      it('should convert vals to numbers', () => {
        const ageColumnInt = CSVRawData.columnArray('Age', {
          parseInt:true,
        });
        const ageColumnFloat = CSVRawData.columnArray('Age', {
          parseFloat:true,
        });
        expect(ageColumnInt[0]).to.be.a('number');
        expect(ageColumnFloat[0]).to.be.a('number');
      });
      it('should standardize scale values', () => {
        const salaryColumn = CSVRawData.columnArray('Salary', {
          prefilter: row => row.Salary,
          parseInt:true,
        });
        const standardScaleSalary = CSVRawData.columnArray('Salary', {
          prefilter: row => row.Salary,
          scale: 'standard',
        });
        expect(JSON.stringify(standardScaleSalary)).to.equal(JSON.stringify(jsk.util.StandardScaler(salaryColumn)));
        expect(jsk.util.sd(standardScaleSalary)).to.equal(1);
        expect(parseInt(Math.round(jsk.util.mean(standardScaleSalary)))).to.equal(0);
      });
      it('should z-score / MinMax scale values', () => {
        const salaryColumn = CSVRawData.columnArray('Salary', {
          prefilter: row => row.Salary,
          parseInt:true,
        });
        const minMaxScaleSalary = CSVRawData.columnArray('Salary', {
          prefilter: row => row.Salary,
          scale: 'minMax',
        });
        // console.log('jsk.util.mean(minMaxScaleSalary)', jsk.util.mean(minMaxScaleSalary));
        expect(JSON.stringify(minMaxScaleSalary)).to.equal(JSON.stringify(jsk.util.MinMaxScaler(salaryColumn)));
        expect(parseInt(Math.round(jsk.util.sd(minMaxScaleSalary)))).to.equal(0);
        expect(parseInt(Math.round(jsk.util.mean(minMaxScaleSalary)))).to.equal(0);
      });
    });
   
  });
});