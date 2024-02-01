import { useState } from "react"
import debounce from 'just-debounce-it'
import Aspect from "./components/Aspect"
import { useEffect } from "react"
import { useRef } from "react"

const ASPECTS_URL = '/aspects.json'
const LOCALIZED_ES = 'esES'
const LOCALIZED_EN = 'enUS'
const LOCAL_STORAGE_ASPECTS_IN_PROPERTY = 'ASPECTS_IN_PROPERTY'

const getLocalized = (objectLocalized) => {
  const text = objectLocalized[LOCALIZED_ES] ?? objectLocalized[LOCALIZED_EN]
  return text
}

function App() {
  const aspectsRef = useRef([])
  const [aspects, setAspects] = useState([])
  const [aspectsInProperty, setAspectsInProperty] = useState([])

  const handleSearchAspects = debounce(async (search) => {
    const searchText = search.target.value

    const aspectsFiltered = aspectsRef.current.filter(({ desc_localized: descLocalized, name_localized: nameLocalized }) => (
      getLocalized(descLocalized).includes(searchText) || getLocalized(nameLocalized).includes(searchText)
    ))
    setAspects(aspectsFiltered)
  }, 500)

  const saveAspectsInProperty = (newAspectsInProperty) => {
    localStorage.setItem(LOCAL_STORAGE_ASPECTS_IN_PROPERTY, JSON.stringify(newAspectsInProperty))
    setAspectsInProperty(newAspectsInProperty)
  }

  const addAspectToPropertyList = (name) => {
    const newAspectsInProperty = [...aspectsInProperty, name]
    saveAspectsInProperty(newAspectsInProperty)
  }

  const removeAspectFromPropertyList = (name) => {
    const newAspectsInProperty = aspectsInProperty.filter(aspect => aspect !== name)
    saveAspectsInProperty(newAspectsInProperty)
  }

  useEffect(() => {
    fetch(ASPECTS_URL).then(response => response.json()).then(data => {
      const aspectsArray = Object.entries(data).map(([name, aspect]) => ({
        name: name,
        ...aspect,
      }))
      aspectsRef.current = aspectsArray
      setAspects(aspectsArray)
    })
    setAspectsInProperty(JSON.parse(localStorage.getItem(LOCAL_STORAGE_ASPECTS_IN_PROPERTY)) ?? [])
  }, [])

  return (
    <div style={{ margin: 50 }}>
      <input placeholder='Search...' style={{ width: '100%', marginBottom: 20 }} onChange={handleSearchAspects} />
      {aspects.map(({ category, desc_localized: descLocalized, in_codex: inCodex, name, name_localized: nameLocalized }) => (
        <div key={name} style={{ margin: 10 }}>
          <Aspect
            id={name}
            category={category}
            desc={getLocalized(descLocalized)}
            inCodex={inCodex}
            name={getLocalized(nameLocalized)}
            isInPorperty={aspectsInProperty.some(aspect => aspect === name)}
            onAddClick={addAspectToPropertyList}
            onRemoveClick={removeAspectFromPropertyList}
          />
        </div>
      ))}
      {/* <Aspect /> */}
    </div>
  )
}

export default App
