import { useState } from "react"
import debounce from 'just-debounce-it'
import Aspect from "./components/Aspect"
import { useEffect } from "react"
import { useRef } from "react"

const LOCAL_STORAGE_ASPECTS_IN_PROPERTY = 'ASPECTS_IN_PROPERTY'
const LOCAL_STORAGE_ASPECTS_NECESSARY = 'ASPECTS_NECESSARY'
const ASPECTS_URL = '/aspects.json'
const LOCALIZED_ES = 'esES'
const LOCALIZED_EN = 'enUS'
const CLASSES_LIST = [
  { id: '', value: 'All classes' },
  { id: 'Barbarian', value: 'Barbarian' },
  { id: 'Druid', value: 'Druid' },
  { id: 'Generic', value: 'Generic' },
  { id: 'Necromancer', value: 'Necromancer' },
  { id: 'Rogue', value: 'Rogue' },
  { id: 'Sorcerer', value: 'Sorcerer' },
]

const getLocalized = (objectLocalized, locale) => {
  const text = objectLocalized[locale] ?? ''
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
  const [aspectsNecessary, setAspectsNecessary] = useState([])
  const [filters, setFilters] = useState({ classSelected: '', searchInput: '', isNecessaryChecked: false })

  const handleSearchAspects = debounce(async (event) => {
    const searchInput = event.target.value
    setFilters({ ...filters, searchInput })
  }, 500)

  const handleFilterNecessary = (event) => {
    const isNecessaryChecked = event.target.checked
    setFilters({ ...filters, isNecessaryChecked })
  }

  const handleSelectClass = (event) => {
    const classSelected = event.target.value
    setFilters({ ...filters, classSelected })
  }

  const saveAspectInProperty = (newAspectsInProperty) => {
    localStorage.setItem(LOCAL_STORAGE_ASPECTS_IN_PROPERTY, JSON.stringify(newAspectsInProperty))
    setAspectsInProperty(newAspectsInProperty)
  }

  const handleAddAspectToPropertyList = (aspectName) => {
    const newAspectsInProperty = [...aspectsInProperty, aspectName]
    saveAspectInProperty(newAspectsInProperty)
  }

  const handleRemoveAspectFromPropertyList = (aspectName) => {
    const newAspectsInProperty = aspectsInProperty.filter(aspect => aspect !== aspectName)
    saveAspectInProperty(newAspectsInProperty)
  }

  const handleCheckAspectNecessary = (event, aspectName) => {
    const isChecked = event.target.checked
    let newAspectsNecessary

    if (isChecked) {
      newAspectsNecessary = [...aspectsNecessary, aspectName]
    } else {
      newAspectsNecessary = aspectsNecessary.filter(aspect => aspect !== aspectName)
    }

    localStorage.setItem(LOCAL_STORAGE_ASPECTS_NECESSARY, JSON.stringify(newAspectsNecessary))
    setAspectsNecessary(newAspectsNecessary)
  }

  useEffect(() => {
    const { classSelected, searchInput, isNecessaryChecked } = filters
    let aspectsFiltered = aspectsRef.current

    if (classSelected !== '') {
      aspectsFiltered = aspectsFiltered.filter(({ class: aspectClass }) => aspectClass === classSelected)
    }
    if (searchInput !== '') {
      aspectsFiltered = aspectsFiltered.filter(({ desc_localized: descLocalized, name_localized: nameLocalized }) => (
        doesTextsIncludes(getLocalized(descLocalized, LOCALIZED_ES), searchInput)
        || doesTextsIncludes(getLocalized(descLocalized, LOCALIZED_EN), searchInput)
        || doesTextsIncludes(getLocalized(nameLocalized, LOCALIZED_ES), searchInput)
        || doesTextsIncludes(getLocalized(nameLocalized, LOCALIZED_EN), searchInput)
      ))
    }
    if (isNecessaryChecked) {
      aspectsFiltered = aspectsFiltered.filter(({ name }) => aspectsNecessary.some(aspectNecessary => aspectNecessary === name))
    }

    setAspects(aspectsFiltered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, aspectsNecessary])

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
    setAspectsNecessary(JSON.parse(localStorage.getItem(LOCAL_STORAGE_ASPECTS_NECESSARY)) ?? [])
  }, [])

  return (
    <div style={{ margin: 50 }}>
      <div style={{ display: 'flex', marginBottom: 20, gap: 10 }}>
        <select id="cars" onChange={handleSelectClass}>
          {CLASSES_LIST.map(({ id, value }) => <option key={id} value={id}>{value}</option>)}
        </select>
        <input placeholder='Search...' style={{ flex: 1, padding: 5 }} onChange={handleSearchAspects} />
        <label onChange={handleFilterNecessary}><input type="checkbox" />💛</label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {aspects.map(({ category/*, class: aspectClass*/, desc_localized: descLocalized, in_codex: inCodex, name, name_localized: nameLocalized }) => (
          <div key={name} style={{ margin: 10 }}>
            <Aspect
              id={name}
              category={category}
              desc={getLocalized(descLocalized, LOCALIZED_ES)}
              // aspectClass={aspectClass}
              inCodex={inCodex}
              name={getLocalized(nameLocalized, LOCALIZED_ES)}
              isInPorperty={aspectsInProperty.some(aspect => aspect === name)}
              isNecessary={aspectsNecessary.some(aspect => aspect === name)}
              onAddClick={handleAddAspectToPropertyList}
              onRemoveClick={handleRemoveAspectFromPropertyList}
              onNecessaryClick={handleCheckAspectNecessary}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
