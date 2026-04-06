package com.finance.dashboard.mapper;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.dto.request.CreateRecordRequest;
import com.finance.dashboard.dto.response.RecordResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface RecordMapper {

    RecordResponse toResponse(FinancialRecord record);

    List<RecordResponse> toResponseList(List<FinancialRecord> records);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "transactionRef", ignore = true)
    FinancialRecord toEntity(CreateRecordRequest request);
}
