import type { Cinema } from '../data'

export function CinemaGrid({ cinemas }: { cinemas: Cinema[] }) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
      {cinemas.map((cinema) => (
        <div key={cinema.id} className="w-full flex items-center justify-between p-6 rounded-2xl bg-[#DDBD68]/5 border border-[#DDBD68]/20 hover:border-[#DDBD68]/50 hover:bg-[#DDBD68]/10 transition-all cursor-pointer">
          <div>
            <h3 className="text-xl font-bold text-[#DDBD68] mb-1">{cinema.name}</h3>
            <p className="text-sm text-gray-300 tracking-wide">{cinema.location}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-medium">{cinema.screens} Screens</p>
            <p className="text-[10px] text-[#DDBD68] uppercase tracking-widest mt-1">Available</p>
          </div>
        </div>
      ))}
    </div>
  )
}
