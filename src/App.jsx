import { useState } from "react"
import debounce from 'just-debounce-it'
import Aspect from "./components/Aspect"
import { useEffect } from "react"
import { useRef } from "react"

const ASPECTS_URL = '/aspects.json'
const LOCALIZED_ES = 'esES'
const LOCALIZED_EN = 'enUS'
const LOCAL_STORAGE_ASPECTS_IN_PROPERTY = 'ASPECTS_IN_PROPERTY'
const CLASSES_LIST = [
  { id: '', value: 'All' },
  { id: 'Barbarian', value: 'Barbarian' },
  { id: 'Druid', value: 'Druid' },
  { id: 'Generic', value: 'Generic' },
  { id: 'Necromancer', value: 'Necromancer' },
  { id: 'Rogue', value: 'Rogue' },
  { id: 'Sorcerer', value: 'Sorcerer' },
]

const getLocalized = (objectLocalized) => {
  const text = objectLocalized[LOCALIZED_ES] ?? objectLocalized[LOCALIZED_EN]
  return text
}

const normalizeText = (text) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

const doesTextsIncludes = (text, textToInclude) => {
  return normalizeText(text).includes(normalizeText(textToInclude));
}

function App() {
  const aspectsRef = useRef([])
  const [aspects, setAspects] = useState([])
  const [aspectsInProperty, setAspectsInProperty] = useState([])
  const [filters, setFilters] = useState({ classSelected: '', searchInput: '' })

  const handleSearchAspects = debounce(async (search) => {
    const searchInput = search.target.value
    setFilters({ ...filters, searchInput })
  }, 500)

  const handleSelectClass = (data) => {
    const classSelected = data.target.value
    setFilters({ ...filters, classSelected })
  }

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
    const { classSelected, searchInput } = filters
    let aspectsFiltered = aspectsRef.current

    if (classSelected !== '') {
      aspectsFiltered = aspectsFiltered.filter(({ class: aspectClass }) => aspectClass === classSelected)
    }
    if (searchInput !== '') {
      aspectsFiltered = aspectsFiltered.filter(({ desc_localized: descLocalized, name_localized: nameLocalized }) => (
        doesTextsIncludes(getLocalized(descLocalized), searchInput) || doesTextsIncludes(getLocalized(nameLocalized), searchInput)
      ))
    }
    
    setAspects(aspectsFiltered)
  }, [filters])

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
      <div style={{ display: 'flex', marginBottom: 20, gap: 10 }}>
        <select id="cars" onChange={handleSelectClass}>
          {CLASSES_LIST.map(({ id, value }) => <option key={id} value={id}>{value}</option>)}
        </select>
        <input placeholder='Search...' style={{ width: '100%', padding: 5 }} onChange={handleSearchAspects} />
      </div>
      {aspects.map(({ category/*, class: aspectClass*/, desc_localized: descLocalized, in_codex: inCodex, name, name_localized: nameLocalized }) => (
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
    </div>
  )
}

export default App
