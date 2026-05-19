import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const iconVoiture = L.divIcon({
  html: `<div style="background:#00875A;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">🚗</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const iconColis = L.divIcon({
  html: `<div style="background:#C2410C;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">📦</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function AutoCenter({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, map.getZoom())
  }, [position])
  return null
}

function calculerDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function estimerTemps(distanceKm) {
  const minutes = Math.round((distanceKm / 40) * 60)
  if (minutes < 1) return "Moins d'1 min"
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m > 0 ? m + 'min' : ''}`
}

const getAuthToken = () => localStorage.getItem('token')

export default function MapSuivi({
  colisId,
  mode,
  positionClient,
  nomDestinataire,
}) {
  const [positionConducteur, setPositionConducteur] = useState(null)
  const [maPosition, setMaPosition] = useState(null)
  const [partage, setPartage] = useState(false)
  const [eta, setEta] = useState(null)
  const [distance, setDistance] = useState(null)
  const [erreur, setErreur] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)
  const intervalRef = useRef(null)
  const watchRef = useRef(null)

  const API = 'http://localhost:8080/api'

  const demarrerPartage = () => {
    if (!navigator.geolocation) {
      setErreur('Géolocalisation non supportée')
      return
    }
    setPartage(true)
    setErreur('')

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMaPosition([latitude, longitude])

        const token = getAuthToken()
        fetch(`${API}/tracking/position/${colisId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ latitude, longitude })
        })
        .then(r => {
          if (!r.ok) r.text().then(t => console.log('Erreur body:', t))
        })
        .catch(e => console.log('Erreur réseau envoi position:', e))

        setLastUpdate(new Date().toLocaleTimeString('fr-FR'))
      },
      (err) => {
        setErreur('Erreur GPS : ' + err.message)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )
  }

  const arreterPartage = () => {
    setPartage(false)
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
  }

  // ✅ Poll position côté client
  useEffect(() => {
    if (mode !== 'client' || !colisId) return

    const fetchPosition = async () => {
      try {
        const token = getAuthToken()
        const res = await fetch(`${API}/tracking/position/${colisId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (res.ok) {
          const data = await res.json()

          // ✅ Vérifie found:false — pas encore de position
          if (!data.found || !data.latitude || !data.longitude) return

          setPositionConducteur([data.latitude, data.longitude])
          setLastUpdate(new Date(data.updatedAt).toLocaleTimeString('fr-FR'))

          if (positionClient) {
            const dist = calculerDistance(
              data.latitude, data.longitude,
              positionClient.lat, positionClient.lng
            )
            setDistance(dist.toFixed(1))
            setEta(estimerTemps(dist))
          }
        }
      } catch (e) {
        console.log('Erreur fetch position:', e)
      }
    }

    fetchPosition()
    intervalRef.current = setInterval(fetchPosition, 10000)
    return () => clearInterval(intervalRef.current)
  }, [colisId, mode])

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const centerMap = positionConducteur || maPosition ||
    (positionClient ? [positionClient.lat, positionClient.lng] : [32.3372, -6.3498])

  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #E5E7EB', boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity:1; }
          50% { opacity:0.4; }
        }
      `}</style>

      {/* Bandeau info */}
      <div style={{ background:'#111827', padding:'0.9rem 1.2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.6rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'rgba(255,255,255,0.12)', color:'white', padding:'0.25rem 0.8rem', borderRadius:50, fontSize:'0.75rem', fontWeight:500, fontFamily:'system-ui,sans-serif' }}>
            <span style={{ width:6, height:6, background: partage || positionConducteur ? '#22C55E' : '#9CA3AF', borderRadius:'50%', display:'inline-block', animation: (partage || positionConducteur) ? 'pulse 1.5s infinite' : 'none' }} />
            {mode === 'conducteur'
              ? (partage ? 'Position partagée en direct' : 'Partage désactivé')
              : (positionConducteur ? 'Conducteur en route' : 'En attente du conducteur')}
          </div>
          {lastUpdate && (
            <span style={{ color:'#6B7280', fontSize:'0.72rem', fontFamily:'system-ui,sans-serif' }}>
              Mis à jour {lastUpdate}
            </span>
          )}
        </div>

        {/* ETA client */}
        {mode === 'client' && eta && (
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:800, fontSize:'1.3rem', color:'#00875A', fontFamily:'system-ui,sans-serif' }}>{eta}</div>
              <div style={{ fontSize:'0.68rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Temps d'arrivée</div>
            </div>
            {distance && (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:'1.3rem', color:'white', fontFamily:'system-ui,sans-serif' }}>{distance} km</div>
                <div style={{ fontSize:'0.68rem', color:'#6B7280', fontFamily:'system-ui,sans-serif' }}>Distance</div>
              </div>
            )}
          </div>
        )}

        {/* Bouton conducteur */}
        {mode === 'conducteur' && (
          <button
            onClick={partage ? arreterPartage : demarrerPartage}
            style={{
              background: partage ? '#C2410C' : '#00875A',
              color:'white', border:'none', borderRadius:8,
              padding:'0.5rem 1.2rem', fontWeight:600, fontSize:'0.83rem',
              cursor:'pointer', fontFamily:'system-ui,sans-serif'
            }}>
            {partage ? '⏹ Arrêter le partage' : '📍 Partager ma position'}
          </button>
        )}
      </div>

      {/* Erreur */}
      {erreur && (
        <div style={{ background:'#FEF2F2', color:'#7F1D1D', padding:'0.6rem 1rem', fontSize:'0.8rem', fontFamily:'system-ui,sans-serif' }}>
          ⚠️ {erreur}
        </div>
      )}

      {/* Carte */}
      <MapContainer
        center={centerMap}
        zoom={13}
        style={{ height:'420px', width:'100%' }}
        scrollWheelZoom={true}>

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === 'client' && positionConducteur && <AutoCenter position={positionConducteur} />}
        {mode === 'conducteur' && maPosition && <AutoCenter position={maPosition} />}

        {/* Marqueur conducteur */}
        {(positionConducteur || maPosition) && (
          <Marker position={positionConducteur || maPosition} icon={iconVoiture}>
            <Popup>
              <strong>🚗 Conducteur</strong><br />
              {lastUpdate && `Mis à jour : ${lastUpdate}`}
            </Popup>
          </Marker>
        )}

        {/* Marqueur destinataire */}
        {positionClient && (
          <Marker position={[positionClient.lat, positionClient.lng]} icon={iconColis}>
            <Popup>
              <strong>📦 {nomDestinataire || 'Destinataire'}</strong><br />
              Lieu de livraison
            </Popup>
          </Marker>
        )}

        {/* Ligne entre les deux */}
        {(positionConducteur || maPosition) && positionClient && (
          <Polyline
            positions={[positionConducteur || maPosition, [positionClient.lat, positionClient.lng]]}
            color="#00875A"
            weight={3}
            dashArray="8,8"
            opacity={0.7}
          />
        )}
      </MapContainer>

      {/* Légende */}
      <div style={{ background:'white', padding:'0.7rem 1.2rem', display:'flex', gap:'1.5rem', borderTop:'1px solid #F3F4F6' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <span>🚗</span>
          <span style={{ fontSize:'0.75rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>Conducteur</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
          <span>📦</span>
          <span style={{ fontSize:'0.75rem', color:'#374151', fontFamily:'system-ui,sans-serif' }}>{nomDestinataire || 'Destinataire'}</span>
        </div>
        {mode === 'client' && !positionConducteur && (
          <span style={{ fontSize:'0.75rem', color:'#9CA3AF', fontFamily:'system-ui,sans-serif', fontStyle:'italic' }}>
            En attente de la position du conducteur...
          </span>
        )}
      </div>
    </div>
  )
}