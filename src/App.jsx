import { useState, useEffect, useRef } from 'react'

const alphaOnly = (str) => str.replace(/[^a-zA-Z]/g, '').toLowerCase()

export default function App() {
    const [players, setPlayers] = useState([])
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const [activeIdx, setActiveIdx] = useState(-1)
    const inputRef = useRef(null)

    useEffect(() => {
        fetch('/cone_drill.json')
            .then(r => r.json())
            .then(data => setPlayers(data))
    }, [])

    const normalizedQuery = alphaOnly(query)
    const filtered = normalizedQuery.length >= 2
        ? players.filter(p =>
            p.player_name && alphaOnly(p.player_name).includes(normalizedQuery)
        ).slice(0, 30)
        : []

    const handleSelect = (player) => {
        setSelected(player)
        setQuery(player.player_name)
        setShowDropdown(false)
        setActiveIdx(-1)
    }

    const handleKeyDown = (e) => {
        if (!showDropdown || filtered.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIdx(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            handleSelect(filtered[activeIdx])
        } else if (e.key === 'Escape') {
            setShowDropdown(false)
        }
    }

    return (
        <>
            <h1>Cone Drill Lookup</h1>
            <div className="search-box">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for a player..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowDropdown(true); setActiveIdx(-1); setSelected(null) }}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                />
                {showDropdown && filtered.length > 0 && (
                    <div className="dropdown">
                        {filtered.map((p, i) => (
                            <div
                                key={`${p.pfr_id || p.player_name}-${p.season}-${i}`}
                                className={`dropdown-item${i === activeIdx ? ' active' : ''}`}
                                onMouseDown={() => handleSelect(p)}
                            >
                                <span>{p.player_name}</span>
                                <span className="meta">{p.pos} · {p.season}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="card">
                    <div className={`headshot-wrapper${!selected.completed_cone ? ' coward' : ''}`}>
                        {selected.headshot ? (
                            <img className="headshot" src={selected.headshot} alt={selected.player_name} />
                        ) : (
                            <div className="headshot placeholder-avatar">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                            </div>
                        )}
                        {!selected.completed_cone && <span className="coward-text">COWARD</span>}
                    </div>
                    <h2 className="player-name">{selected.player_name}</h2>

                    <div className={`cone-status ${selected.completed_cone ? 'completed' : 'not-completed'}`}>
                        {selected.completed_cone ? '✓ Completed Cone Drill' : '✗ Did Not Complete Cone Drill'}
                    </div>

                    {selected.completed_cone && (
                        <div className="cone-time">
                            {selected.cone}s
                            <small>3-Cone Drill Time</small>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
