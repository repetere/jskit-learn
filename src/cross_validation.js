import { default as Random, } from 'random-js';
import { default as range, } from 'lodash.range';
import { ml, } from './ml';
import { util, } from './util';
import { DataSet, } from './DataSet';
const Matrix = ml.Matrix;
const ConfusionMatrix = ml.ConfusionMatrix;

/**
 * Split arrays into random train and test subsets
 * @memberOf cross_validation
 * @example
 * const testArray = [20, 25, 10, 33, 50, 42, 19, 34, 90, 23, ];
// { train: [ 50, 20, 34, 33, 10, 23, 90, 42 ], test: [ 25, 19 ] }
const trainTestSplit = jsk.cross_validation.train_test_split(testArray,{ test_size:0.2, random_state: 0, });
 * @param {array} dataset - array of data to split
 * @param {object} options
 * @param {number} [options.test_size=0.2] - represent the proportion of the dataset to include in the test split, can be overwritten by the train_size 
 * @param {number} [options.train_size=0.8] - represent the proportion of the dataset to include in the train split 
 * @param {number} [options.random_state=0] - the seed used by the random number generator
 * @param {boolean} [options.return_array=false] - will return an object {train,test} of the split dataset by default or [train,test] if returned as an array
 * @returns {(Object|array)} returns training and test arrays either as an object or arrays
 */
function train_test_split(dataset = [], options = {
  test_size: 0.2,
  train_size: 0.8,
  random_state: 0,
  return_array: false,
  parse_int_train_size: true,
}) {
  const engine = Random.engines.mt19937().seed(options.random_state || 0);
  const training_set = [];
  const parse_int_train_size = (typeof options.parse_int_train_size === 'boolean') ? options.parse_int_train_size : true;
  const train_size_length = (options.train_size)
    ? options.train_size * dataset.length
    : (1 - (options.test_size || 0.2)) * dataset.length;
  const train_size = parse_int_train_size
    ? parseInt(train_size_length, 10)
    : train_size_length;
  const dataset_copy = [].concat(dataset);

  while (training_set.length < train_size) {
    const index = Random.integer(0, (dataset_copy.length - 1))(engine);
    // console.log({ index });
    training_set.push(dataset_copy.splice(index, 1)[0]);
  }
  return (options.return_array) ? [training_set, dataset_copy,] : {
    train: training_set,
    test: dataset_copy,
  };
}

/**
 * Provides train/test indices to split data in train/test sets. Split dataset into k consecutive folds.
Each fold is then used once as a validation while the k - 1 remaining folds form the training set.
 * @memberOf cross_validation
 * @example
 * const testArray = [20, 25, 10, 33, 50, 42, 19, 34, 90, 23, ];
// [ [ 50, 20, 34, 33, 10 ], [ 23, 90, 42, 19, 25 ] ] 
const crossValidationArrayKFolds = jsk.cross_validation.cross_validation_split(testArray, { folds: 2, random_state: 0, });
 * @param {array} dataset - array of data to split
 * @param {object} options
 * @param {number} [options.folds=3] - Number of folds 
 * @param {number} [options.random_state=0] - the seed used by the random number generator
 * @returns {array} returns  dataset split into k consecutive folds
 */
function cross_validation_split(dataset = [], options = {
  folds: 3,
  random_state: 0,
}) { //kfolds
  const engine = Random.engines.mt19937().seed(options.random_state || 0);
  const folds = options.folds || 3;
  const dataset_split = [];
  const dataset_copy = [].concat(dataset);
  const foldsize = parseInt(dataset.length / (folds || 3), 10);
  for (let i in range(folds)) {
    const fold = [];
    while (fold.length < foldsize) {
      const index = Random.integer(0, (dataset_copy.length - 1))(engine);
      fold.push(dataset_copy.splice(index, 1)[0]);
    }
    dataset_split.push(fold);
  }

  return dataset_split;
}

function cross_validate_score(options = {}) {
  const config = Object.assign({}, {
    // classifier,
    // regression,
    // dataset,
    // testingset,
    dependentFeatures: [ ['X'], ],
    independentFeatures: [ ['Y'], ],
    // random_state,
    folds: 10,
    // accuracy: 'mean',
    use_train_x_matrix: true,
    use_train_y_matrix: false,
  }, options);
  const classifier = config.classifier;
  const regression = config.regression;
  const folds = cross_validation_split(config.dataset, {
    folds: config.folds,
    random_state: config.random_state,
  });
  const testingDataSet = new DataSet(config.testingset);
  const y_test_matrix = testingDataSet.columnMatrix(config.independentFeatures);
  const x_test_matrix = testingDataSet.columnMatrix(config.dependentFeatures);
  const actuals = util.pivotVector(y_test_matrix)[ 0 ];
  const prediction_accuracies = folds.map(fold => { 
    const trainingDataSet = new DataSet(fold);
    const x_train = trainingDataSet.columnMatrix(config.dependentFeatures);
    const y_train = trainingDataSet.columnMatrix(config.independentFeatures);
    const x_train_matrix = (config.use_train_x_matrix) ? new Matrix(x_train) : x_train;
    const y_train_matrix = (config.use_train_y_matrix) ? new Matrix(y_train) : y_train;

    if (regression) {
      
    } else {
      classifier.train(x_train_matrix, y_train_matrix);
      const estimates = classifier.predict(x_test_matrix);
      const CM = ConfusionMatrix.fromLabels(actuals, estimates);
      return CM.getAccuracy();
    }
  });
  return prediction_accuracies;
}

function grid_search(options = {}) {
  const config = Object.assign({}, {
    parameters :[],
    search : () => { },
  }, options);
  
}

/**
 * @namespace
 * @see {@link https://machinelearningmastery.com/implement-resampling-methods-scratch-python/}
 */
export const cross_validation = {
  train_test_split,
  cross_validation_split,
  kfolds: cross_validation_split,
  cross_validate_score,
  grid_search,
};