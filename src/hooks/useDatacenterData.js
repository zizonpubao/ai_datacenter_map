import { useEffect, useState } from 'react'

export function useDatacenterData() {
  const [sites, setSites] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/datacenters.json`
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)
        return res.json()
      })
      .then((json) => {
        setSites(json.sites || [])
        setLastUpdated(json.last_updated || null)
        setStatus('ready')
      })
      .catch((err) => {
        console.error(err)
        setStatus('error')
      })
  }, [])

  return { sites, lastUpdated, status }
}
