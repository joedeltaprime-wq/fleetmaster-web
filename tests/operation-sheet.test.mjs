import assert from 'node:assert/strict'
import test from 'node:test'
import { parseOperationSheetRows } from '../lib/data/operation-sheet-mapping.ts'

test('maps positional OPERATION rows, unique trucks, and the E2 Home Time summary', () => {
  const rows = []
  for (let index = 0; index < 113; index += 1) {
    rows.push([`truck-${index + 1}`, index < 84 ? 'ON DUTY' : 'Need a Driver'])
  }

  assert.deepEqual(parseOperationSheetRows('HOME TIME: 0', rows), {
    totalTrucks: 113,
    activeTrucks: 84,
    needDriverTrucks: 29,
    homeTime: 0,
  })
})

test('deduplicates repeated Truck Unit values but rejects conflicting statuses', () => {
  const repeated = [['1032', 'ON DUTY'], [' 1032 ', 'ON DUTY']]
  assert.equal(parseOperationSheetRows('HOME TIME: 2', repeated).totalTrucks, 1)

  const conflicting = [['1032', 'ON DUTY'], ['1032', 'Need a Driver']]
  assert.throws(() => parseOperationSheetRows('HOME TIME: 2', conflicting), /conflicting statuses/)
})

test('rejects statuses without a confirmed mapping and marks malformed Home Time as unavailable', () => {
  const unknownStatus = [['1032', 'BROKEN TRUCK']]
  assert.throws(() => parseOperationSheetRows('HOME TIME: 0', unknownStatus), /unmapped truck status/)

  const malformedHomeTime = [['1032', 'ON DUTY']]
  assert.equal(parseOperationSheetRows('HOME TIME: unavailable', malformedHomeTime).homeTime, null)
})
