import SmartSearch from '../component/SmartSearch'
import Field, { defaultComparison } from '../component/types/Field'
import Matcher from '../component/types/Matcher'
import { fireEvent, render } from '@testing-library/react'
import {
  dualMatchers,
  multipleListMatchers,
  multipleMatchers,
  singleMatcher,
} from './testData'
import { TestHarness, createTestHarness, waitForElement } from './TestHarness'

const simpleField: Field[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 1,
    selectionLimit: 2,
    definitions: [
      {
        source: ['asdas', 'assda', 'loadsp'],
      }
    ]
  },
]

describe('SmartSearch', () => {
  it('basic render shows an input box', () => {
    const result = render(<SmartSearch fields={simpleField} />)
    const element = result.container.querySelector('#edit_input')
    expect(element).toHaveValue('')
  })

  it('basic render with matchers, displays matchers and input', () => {
    const result = createSmartSearch(singleMatcher)
    result.assertElementValue('#edit_input', '')
    result.assertElementText('#test_label', '= text')
  })

  it('basic render with matchers, displays multiple matchers', () => {
    const result = createSmartSearch(multipleMatchers)
    result.assertElementValue('#edit_input', '')
    result.assertElementText('#test_label', '= text')
    result.assertElementText('#test2_label', 'or = text2')
    result.assertElementText('#test3_label', 'and = text3')
  })

  it.each<[string, string]>([
    ['=', 'and = text'],
    ['!', 'and ! text'],
    ['>', 'and > text'],
    ['<', 'and < text'],
    ['>=', 'and >= text'],
    ['<=', 'and <= text'],
    ['*', 'and * text'],
    ['!*', 'and !* text'],
  ])('For symbol %p text is "%p"', (comp, text) => {
    const result = createSmartSearch(dualMatchers(comp))

    const input = result.getElement('#edit_input')
    expect(input).toBeDefined()
    result.assertElementText('#test2_label', text)
  })

  it('left arrow, moves to previous', async () => {
    const result = createSmartSearch(multipleMatchers)
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowLeft',
      shiftKey: true,
    })
    result.assertElementValue('#test3_input', '& =text3')
    result.fireChange('#test3_input', { target: { value: '' } })
    result.fireKeyDown('#test3_input', {
      code: 'ArrowLeft',
    })
    result.assertElementValue('#test2_input', '| =text2')
  })

  it('shift left arrow, moves to previous', async () => {
    const result = createSmartSearch(multipleMatchers)
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowLeft',
      shiftKey: true,
    })
    result.assertElementValue('#test3_input', '& =text3')
  })

  it('right arrow, moves to next', async () => {
    const result = createSmartSearch(multipleMatchers)
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowRight',
      shiftKey: true,
    })
    result.assertElementValue('#test_input', '=text')
    result.fireKeyDown('#test_input', {
      code: 'ArrowRight',
    })
    result.assertElementValue('#test2_input', '| =text2')
  })

  it('shift right arrow, moves to next', async () => {
    const result = createSmartSearch(multipleMatchers)
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowRight',
      shiftKey: true,
    })
    result.assertElementValue('#test_input', '=text')
  })

  it('ctrl left arrow, moves element left', async () => {
    const result = createSmartSearch(
      multipleMatchers
    )
    const matchers = multipleMatchers
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowLeft',
      shiftKey: true,
    })
    expect(
      result.getRelativeElemementPosition(null, '#test3_view', '#test_view'),
    ).toBe(2)
    expect(
      result.getRelativeElemementPosition(null, '#test3_view', '#test2_view'),
    ).toBe(2)

    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowLeft',
      ctrlKey: true,
    })
    expect(
      result.getRelativeElemementPosition(null, '#test3_view', '#test_view'),
    ).toBe(2)
    expect(
      result.getRelativeElemementPosition(null, '#test3_view', '#test2_view'),
    ).toBe(4)
    expect(updatedMatchers).toStrictEqual([
      matchers[0],
      matchers[2],
      matchers[1],
    ])
  })

  it('ctrl right arrow moves element right', async () => {
    const result = createSmartSearch(
      multipleMatchers
    )
    const matchers = multipleMatchers
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowRight',
      shiftKey: true,
    })
    expect(
      result.getRelativeElemementPosition(null, '#test_view', '#test2_view'),
    ).toBe(4)
    expect(
      result.getRelativeElemementPosition(null, '#test_view', '#test3_view'),
    ).toBe(4)
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowRight',
      ctrlKey: true,
    })
    expect(
      result.getRelativeElemementPosition(null, '#test_view', '#test2_view'),
    ).toBe(2)
    expect(
      result.getRelativeElemementPosition(null, '#test_view', '#test3_view'),
    ).toBe(4)

    expect(updatedMatchers).toStrictEqual([
      matchers[1],
      matchers[0],
      matchers[2],
    ])
  })

  it('update matcher', async () => {
    const result = createSmartSearch(singleMatcher)
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowLeft',
      shiftKey: true,
    })
    result.fireChange('#test_input', { target: { value: 'a' } })
    result.fireKeyDown('#test_input', { code: 'Enter' })
    await waitForElement(result, '= asdas', true)
    result.assertElementText('#test_label', '= asdas')
  })

  it('delete matcher', async () => {
    const result = createSmartSearch(
      singleMatcher,
    )

    result.fireMouseEnter('#test_view')
    result.fireClick('svg')
    expect(updatedMatchers).toStrictEqual([])
  })

  it('select matcher', async () => {
    const result = createSmartSearch(singleMatcher)
    result.fireClick('#edit_input')
    result.fireClick('#test_view')
    result.assertElementValue('#test_input', '=text')
  })

  it('cancel select of matcher', async () => {
    const result = createSmartSearch(singleMatcher)
    result.fireClick('#edit_input')
    result.fireClick('#test_view')
    result.fireKeyDown('#test_input', { code: 'Enter' })
    result.assertElementText('#test_label', '= text')
  })

  it('add matcher', async () => {
    const result = createSmartSearch(
      singleMatcher,
    )
    result.fireChange('#edit_input', { target: { value: 'a' } })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(updatedMatchers.length).toBe(2)
  })

  it('delete last matcher', async () => {
    const result = createSmartSearch(
      multipleMatchers,
    )
    result.fireKeyDown('#SmartSearch', { code: 'Backspace', shiftKey: true })
    expect(updatedMatchers.length).toBe(2)
  })

  it('delete all matcher', async () => {
    const result = createSmartSearch(
      multipleMatchers,
    )
    result.fireKeyDown('#SmartSearch', { code: 'Backspace', ctrlKey: true })
    expect(updatedMatchers.length).toBe(0)
  })

  it('edit matcher', async () => {
    const result = createSmartSearch(singleMatcher)
    result.fireKeyDown('#edit_input', { code: 'Backspace' })
    result.assertElementValue('#test_input', '=text')
  })

  it('start drag', async () => {
    const result = createSmartSearch(multipleMatchers)
    const div = result.getElement('#test3_view')
    let dragFormat = ''
    let dragData = ''
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dragFormat = format
        dragData = data
      },
      effectAllowed: '',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.dragStart(div, {
        dataTransfer,
      })
    expect(dragFormat).toBe('multi-select/matcher/test3')
    expect(dragData).toBe(
      '{"key":"test3","operator":"&","comparison":"=","source":"test","value":"value3","text":"text3"}',
    )
    expect(dataTransfer.effectAllowed).toBe('move')
  })

  it('drag over good', async () => {
    const result = createSmartSearch(multipleMatchers)
    const div = result.getElement('#test2_view')
    const dataTransfer = {
      types: ['multi-select/matcher/test3'],
      dropEffect: '',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.dragOver(div, {
        dataTransfer,
      })
    expect(dataTransfer.dropEffect).toBe('move')
  })

  it('drag over bad', async () => {
    const result = createSmartSearch(multipleMatchers)
    const div = result.getElement('#test3_view')
    const dataTransfer = {
      types: ['multi-select/matcher/test3'],
      dropEffect: '',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.dragOver(div, {
        dataTransfer,
      })
    expect(dataTransfer.dropEffect).toBe('')
  })

  it('drop data', async () => {
    const result = createSmartSearch(multipleMatchers)
    const div = result.getElement('#test2_view')
    const dataTransfer = {
      types: ['multi-select/matcher/test3'],
      getData: () =>
        '{"key":"test3","operator":"&","comparison":"=","source":"test","value":"value3","text":"text3"}',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.drop(div, {
        dataTransfer,
      })
    expect(updatedMatchers).toStrictEqual([
      multipleMatchers[0],
      multipleMatchers[2],
      multipleMatchers[1],
    ])
  })

  it('test validate add', async () => {
    const result = createSmartSearch(
      multipleListMatchers,
    )
    result.fireChange('#edit_input', { target: { value: 'asdas' } })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    const error = result.getElement('#editError')
    expect(error?.textContent).toBe('Datasource (list) is limited to 2 items.')
  })

  it('test validate open bracket', async () => {
    const result = createSmartSearch(multipleListMatchers)

    result.fireChange('#edit_input', { target: { value: '(' } })
    const error = result.getElement('#editError')
    expect(error).toBe(null)
  })

  it('test validate close bracket', async () => {
    const result = createSmartSearch(multipleListMatchers)

    result.fireChange('#edit_input', { target: { value: ')' } })
    const error = result.getElement('#editError')
    expect(error).toBe(null)
  })

  it('test highlight mismatched open brackets', async () => {
    const result = createSmartSearch(multipleListMatchers)

    result.fireChange('#edit_input', { target: { value: '(' } })
    const bracket = result.getByText('and (')
    expect(bracket.className).toBe('MatcherDisplayWarning')
  })

  it('test highlight mismatched close brackets', async () => {
    const result = createSmartSearch(multipleListMatchers)
    result.fireChange('#edit_input', { target: { value: ')' } })
    const bracket = result.getByText(')')
    expect(bracket.className).toBe('MatcherDisplayWarning')
  })

  it('test validate edit', async () => {
    const result = createSmartSearch(
      multipleListMatchers,
    )
    result.fireKeyDown('#SmartSearch', {
      code: 'ArrowLeft',
      shiftKey: true
    })
    result.fireChange('#test3_input', { target: { value: 'asdas' } })
    result.fireKeyDown('#test3_input', { code: 'Enter' })
    const error = result.getElement('#editError')
    expect(error?.textContent).toBe('Datasource (list) is limited to 2 items.')
  })
})


let updatedMatchers: Matcher[] = []
const createSmartSearch = (
  matchers: Matcher[]
): TestHarness => {
  updatedMatchers = matchers
  return createTestHarness(render(
    <SmartSearch
      fields={simpleField}
      matchers={matchers}
      onMatchersChanged={m => updatedMatchers = m}
    />,
  ))
}
