import { check } from 'express-validator';

export const tagCreateValidator = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Tag Name is required')
];

