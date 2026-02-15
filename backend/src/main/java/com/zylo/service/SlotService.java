package com.zylo.service;

import com.zylo.domain.Court;
import com.zylo.domain.Slot;
import com.zylo.dto.slot.SlotDto;
import com.zylo.dto.slot.SlotsByCourtDto;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.CourtRepository;
import com.zylo.repository.SlotRepository;
import com.zylo.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;
    private final CourtRepository courtRepository;
    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public List<SlotsByCourtDto> getVenueSlots(UUID venueId, LocalDate date) {
        if (!venueRepository.existsById(venueId)) {
            throw new ApiException(ErrorCode.VENUE_NOT_FOUND);
        }

        List<Slot> slots = slotRepository.findByVenueIdAndDate(venueId, date);

        // Group slots by court
        Map<UUID, List<Slot>> slotsByCourt = slots.stream()
            .collect(Collectors.groupingBy(
                slot -> slot.getCourt().getId(),
                LinkedHashMap::new,
                Collectors.toList()
            ));

        List<SlotsByCourtDto> result = new ArrayList<>();

        for (Map.Entry<UUID, List<Slot>> entry : slotsByCourt.entrySet()) {
            List<Slot> courtSlots = entry.getValue();
            if (courtSlots.isEmpty()) continue;

            Court court = courtSlots.get(0).getCourt();
            List<SlotDto> slotDtos = courtSlots.stream()
                .map(SlotDto::fromEntity)
                .toList();

            result.add(SlotsByCourtDto.builder()
                .courtId(court.getId())
                .courtName(court.getName())
                .sport(court.getSport())
                .pricePerHour(court.getPricePerHour())
                .slots(slotDtos)
                .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<SlotDto> getCourtSlots(UUID courtId, LocalDate date) {
        if (!courtRepository.existsById(courtId)) {
            throw new ApiException(ErrorCode.COURT_NOT_FOUND);
        }

        return slotRepository.findByCourtIdAndDate(courtId, date)
            .stream()
            .map(SlotDto::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<SlotDto> getAvailableSlots(UUID courtId, LocalDate date) {
        return slotRepository.findAvailableSlots(courtId, date)
            .stream()
            .map(SlotDto::fromEntity)
            .toList();
    }
}
