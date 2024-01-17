import * as React from 'react'
import { Option, SmartSearchStyles, Config } from '../../types'
import { configContext } from '@/component/state/context'
import './OptionList.css'

interface OptionListProps {
  left?: number
  top?: number
  height?: number
  width?: number
  options: Option[]
  activeOption: number
  onSelectOption: (option: Option, insert: boolean) => void
  onSelectActiveOption: (index: number) => void
  styles?: SmartSearchStyles
}

const OptionList: React.FC<OptionListProps> = ({
  top,
  left,
  width,
  height,
  options,
  activeOption,
  onSelectOption,
  onSelectActiveOption,
  styles,
}) => {
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const [topHeight, setTopHeight] = React.useState<number>(0)
  const [bottomHeight, setBottomHeight] = React.useState<number>(0)
  const config = React.useContext<Config>(configContext)

  //scroll selected item into view
  React.useEffect(() => {
    if (activeItemRef.current && activeItemRef.current.scrollIntoView) {
      activeItemRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [activeOption])

  /*
  @param {MouseEvent} event: mouse event
  @param {Option} option: option to select
*/
  const selectOption = (
    event: React.MouseEvent,
    option: Option
  ) => {
    onSelectOption(option, event.shiftKey)
    event.stopPropagation()
  }

  const mapOption = (
    option: Option,
    index: number,
    pageUpIndex: number,
    pageDownIndex: number,
    scale: number,
    opacity: number,
    shift: number
  ) => {
    const homeEnd = index === 0 && (option.source !== options[activeOption].source) ? 'Home' : index === options.length - 1 && (option.source !== options[activeOption].source) ? 'End' : ''
    const pgUpDown = (index === pageUpIndex ? 'PgUp' : index === pageDownIndex ? 'PgDown' : '')
    const allKeys = (homeEnd !== '' && pgUpDown !== '' ? `${homeEnd} / ${pgUpDown}` : homeEnd !== '' ? homeEnd : pgUpDown)

    return (
      <li
        ref={index === activeOption ? activeItemRef : undefined}
        className={'optionListOption'}
        style={{
          ...styles?.option,
          transform: `scaleY(${scale}) translateX(${shift}px)`,
          opacity
        }}
        key={option.value.toString()}
        onMouseEnter={() => onSelectActiveOption(index)}
        onClick={(e) => selectOption(e, option)}
      >
        {`${option.text} : ${option.source}` + (allKeys !== ''
          ? ` (${allKeys})`
          : '')}
      </li>
    )
  }

  const updateBottomHeight = (div: HTMLDivElement | null) => {
    if (div) {
      setBottomHeight(div.clientHeight)
    }
  }

  const updateTopHeight = (div: HTMLDivElement | null) => {
    if (div) {
      setTopHeight(div.clientHeight)
    }
  }


  let pageUpIndex = -1
  let pageDownIndex = -1
  const activeGroup = options[activeOption].source
  for (let index = activeOption; index >= 0; index--) {
    if (activeGroup !== options[index].source) {
      pageUpIndex = index
      break;
    }
  }
  for (let index = activeOption; index < options.length; index++) {
    if (activeGroup !== options[index].source) {
      pageDownIndex = index
      break;
    }
  }
  const maxItems = options.length > 10 ? 5 : Math.floor((options.length - 1) / 2)
  const currentOpion = options[activeOption]
  const topOptions = [...(activeOption < maxItems ? options.slice(options.length - (maxItems - activeOption) - 1, options.length - 1) : []),
  ...(activeOption > 0 ? options.slice(activeOption - 1 - maxItems >= 0 ? activeOption - maxItems : 0, activeOption) : [])]
  const bottomOptions = [...(activeOption + 1 < options.length ? options.slice(activeOption + 1, activeOption + maxItems < options.length ? activeOption + maxItems + 1 : options.length) : []),
  ...(activeOption + maxItems >= options.length ? options.slice(0, maxItems - (options.length - activeOption) + 1) : [])]

  return (
    <>
      <div
        ref={updateTopHeight}
        className='topList'
        style={{
          top: topHeight * -1,
          left: (left ?? 0) + (width ?? 0) + 6
        }}
      >
        {
          topOptions && <ul>
            {
              topOptions.map((option, index) => mapOption(option, index, pageUpIndex, pageDownIndex, 1 - ((topOptions.length - index - 1) / 10), 1 - ((topOptions.length - index - 1) / 20), (topOptions.length - index - 1) * 2))
            }
          </ul>
        }
      </div>
      <div
        className='activeOption'
        style={{
          left: (left ?? 0) + (width ?? 0) + 16
        }}
      >
        {`${currentOpion.text} : ${currentOpion.source}`}
      </div>
      <div
        ref={updateBottomHeight}
        className='bottomList'
        style={{
          top: height,
          left: (left ?? 0) + (width ?? 0) + 6
        }}
      >
        {
          bottomOptions && <ul>
            {
              bottomOptions.map((option, index) => mapOption(option, index, pageUpIndex, pageDownIndex, 1 - (index / 10), 1 - (index / 20), index * 2))
            }
          </ul>
        }
      </div>
    </>
  )
}

export default OptionList
